import request from '@/config/axios'

// ERP 产品 VO
export interface ProductVO {
  id: number // 产品编号
  name: string // 产品名称
  barCode: string // 产品条码
  categoryId: number // 产品类型编号
  unitId: number // 单位编号
  unitName?: string // 单位名字
  status: number // 产品状态
  standard: string // 产品规格
  remark: string // 产品备注
  expiryDay: number // 保质期天数
  weight: number // 重量（kg）
  purchasePrice: number // 采购价格，单位：元
  salePrice: number // 销售价格，单位：元
  minPrice: number // 最低价格，单位：元
  color: string // 颜色
  profitId: number // 产品利润编号
  estimatedProfit: number // 预估利润
}

// ERP 产品变种skc VO
export interface ProductSkcVO {
  id: number // 产品变种编号
  name: string // 产品变种名称
  barCode: string // 产品变种条码
  productId: number // 上级产品编号
  unitId: number // 单位编号
  unitName?: string // 单位名字
  status: number // 产品变种状态
  standard: string // 产品变种规格
  remark: string // 产品变种备注
  expiryDay: number // 保质期天数
  weight: number // 重量（kg）
  purchasePrice: number // 采购价格，单位：元
  salePrice: number // 销售价格，单位：元
  minPrice: number // 最低价格，单位：元
  color: string // 颜色
}

// ERP 产品利润 VO
export interface ProductProfitVO {
  id: number// 编号
  productId: number// 产品编号
  profit: number// 产品利润
  purchasePrice: number// 采购价格
  salePrice: number// 销售价格
  firstLegPrice: number// 头程价格
  lastMilePrice: number// 尾程价格
  refundRate: number// 退货率
  refundFreight: number// 退货运费
  otherPrice: number// 其他费用
  otherDetail: string// 其他费用详情
  remark: string// 备注
}

// ERP 产品 API
export const ProductApi = {
  // 查询产品分页
  getProductPage: async (params: any) => {
    return await request.get({ url: `/erp/product/page`, params })
  },

  // 查询产品精简列表
  getProductSimpleList: async () => {
    return await request.get({ url: `/erp/product/simple-list` })
  },

  // 查询产品详情
  getProduct: async (id: number) => {
    return await request.get({ url: `/erp/product/get?id=` + id })
  },

  // 查询产品变种skc详情
   getProductSkc: async (id: number) => {
    return await request.get({ url: `/erp/product/getSkc?id=` + id })
  },

  // 新增产品
  createProduct: async (data: ProductVO) => {
    return await request.post({ url: `/erp/product/create`, data })
  },

   // 新增产品变种skc
   createProductSkc: async (data: ProductSkcVO) => {
    return await request.post({ url: `/erp/product/createSkc`, data })
  },

  // 修改产品
  updateProduct: async (data: ProductVO) => {
    return await request.put({ url: `/erp/product/update`, data })
  },

  // 修改产品skc
   updateProductSkc: async (data: ProductSkcVO) => {
    return await request.put({ url: `/erp/product/updateSkc`, data })
   },

  // 删除产品
  deleteProduct: async (id: number) => {
    return await request.delete({ url: `/erp/product/delete?id=` + id })
  },
  // 删除产品变种skc
  deleteProductSkc: async (id: number) => {
    return await request.delete({ url: `/erp/product/deleteSkc?id=` + id })
  },
  // 导出产品 Excel
  exportProduct: async (params) => {
    return await request.download({ url: `/erp/product/export-excel`, params })
  },
  // 新增产品预估利润
  createProductProfit: async (data: ProductProfitVO) => {
    return await request.post({ url: `/erp/product/createProfit`, data })
  },
  // 修改产品预估利润
  updateProductProfit: async (data: ProductProfitVO) => {
    return await request.put({ url: `/erp/product/updateProfit`, data })
   },
  // 查询产品利润详情
  getProductProfit: async (id: number) => {
    return await request.get({ url: `/erp/product/getProfit?id=` + id })
  },
}
