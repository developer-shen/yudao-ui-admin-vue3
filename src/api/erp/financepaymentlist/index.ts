import request from '@/config/axios'

// ERP 付款清单 VO
export interface FinancePaymentListVO {
  id: number // 编号
  financeUserId: number // 财务人员
  paymentTime: Date // 付款时间
  paymentPrice: number // 实付金额
  paymentWay: string // 付款方式
  paymentPurpose: string // 付款用途
  fileUrl: string // 附件
  remark: string // 备注
}

// ERP 付款清单 API
export const FinancePaymentListApi = {
  // 查询ERP 付款清单分页
  getFinancePaymentListPage: async (params: any) => {
    return await request.get({ url: `/erp/finance-payment-list/page`, params })
  },

  // 查询ERP 付款清单详情
  getFinancePaymentList: async (id: number) => {
    return await request.get({ url: `/erp/finance-payment-list/get?id=` + id })
  },

  // 新增ERP 付款清单
  createFinancePaymentList: async (data: FinancePaymentListVO) => {
    return await request.post({ url: `/erp/finance-payment-list/create`, data })
  },

  // 修改ERP 付款清单
  updateFinancePaymentList: async (data: FinancePaymentListVO) => {
    return await request.put({ url: `/erp/finance-payment-list/update`, data })
  },

  // 删除ERP 付款清单
  deleteFinancePaymentList: async (id: number) => {
    return await request.delete({ url: `/erp/finance-payment-list/delete?id=` + id })
  },

  // 导出ERP 付款清单 Excel
  exportFinancePaymentList: async (params) => {
    return await request.download({ url: `/erp/finance-payment-list/export-excel`, params })
  }
}