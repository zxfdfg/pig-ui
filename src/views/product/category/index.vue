<template>
	<div class="category-container">
		<!-- 操作栏 -->
		<el-card class="toolbar-card" shadow="never">
			<el-button v-auth="'product_category_add'" type="primary" @click="handleAdd(null)">新增根分类</el-button>
		</el-card>

		<!-- 分类树 -->
		<el-card class="table-card" shadow="never">
			<el-table
				v-loading="loading"
				:data="categoryTree"
				row-key="id"
				border
				stripe
				default-expand-all
				:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
			>
				<el-table-column prop="name" label="分类名称" min-width="200" />
				<el-table-column prop="sort" label="排序" width="100" />
				<el-table-column prop="productCount" label="商品数量" width="120" />
				<el-table-column label="操作" width="250" fixed="right">
					<template #default="{ row }">
						<el-button v-auth="'product_category_add'" link type="primary" size="small" @click="handleAdd(row)">
							新增子分类
						</el-button>
						<el-button v-auth="'product_category_edit'" link type="primary" size="small" @click="handleEdit(row)">
							编辑
						</el-button>
						<el-button v-auth="'product_category_del'" link type="danger" size="small" @click="handleDelete(row)">
							删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!-- 分类表单对话框 -->
		<el-dialog
			v-model="dialogVisible"
			:title="dialogTitle"
			width="500px"
			:close-on-click-modal="false"
			@close="handleDialogClose"
		>
			<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
				<el-form-item label="上级分类">
					<el-tree-select
						v-model="form.parentId"
						:data="categoryTree"
						:props="{ label: 'name', value: 'id' }"
						placeholder="请选择上级分类（不选则为根分类）"
						clearable
						check-strictly
					/>
				</el-form-item>
				<el-form-item label="分类名称" prop="name">
					<el-input v-model="form.name" placeholder="请输入分类名称" />
				</el-form-item>
				<el-form-item label="排序">
					<el-input-number v-model="form.sort" :min="0" :step="1" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleSubmit">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="CategoryList">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '/@/api/product/category'

// 分类树
const loading = ref(false)
const categoryTree = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = reactive({
	id: null,
	parentId: null,
	name: '',
	sort: 0
})

// 表单验证规则
const rules = {
	name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// 加载分类树
const loadCategoryTree = async () => {
	loading.value = true
	try {
		const res = await getCategoryTree()
		categoryTree.value = res.data
	} catch (error) {
		ElMessage.error('加载分类失败')
	} finally {
		loading.value = false
	}
}

// 新增
const handleAdd = (parent: any) => {
	dialogTitle.value = parent ? '新增子分类' : '新增根分类'
	form.parentId = parent ? parent.id : null
	dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
	dialogTitle.value = '编辑分类'
	Object.assign(form, row)
	dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
	if (row.productCount > 0) {
		ElMessage.warning('该分类下有商品，无法删除')
		return
	}
	if (row.children && row.children.length > 0) {
		ElMessage.warning('该分类下有子分类，无法删除')
		return
	}

	ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(async () => {
			try {
				await deleteCategory(row.id)
				ElMessage.success('删除成功')
				loadCategoryTree()
			} catch (error: any) {
				ElMessage.error(error.msg || '删除失败')
			}
		})
		.catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
	if (!formRef.value) return
	await formRef.value.validate(async (valid) => {
		if (valid) {
			try {
				if (form.id) {
					await updateCategory(form)
					ElMessage.success('更新成功')
				} else {
					await createCategory(form)
					ElMessage.success('创建成功')
				}
				dialogVisible.value = false
				loadCategoryTree()
			} catch (error: any) {
				ElMessage.error(error.msg || '操作失败')
			}
		}
	})
}

// 关闭对话框
const handleDialogClose = () => {
	formRef.value?.resetFields()
	form.id = null
	form.parentId = null
}

onMounted(() => {
	loadCategoryTree()
})
</script>

<style scoped lang="scss">
.category-container {
	padding: 20px;

	.toolbar-card,
	.table-card {
		margin-bottom: 20px;
	}
}
</style>
