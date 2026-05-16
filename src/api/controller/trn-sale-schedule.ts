import api from "../axios-service";
import {
  BaseQueryModel,
  BaseSearchModel,
  BaseSearchQueryModel,
} from "../interface";

export interface SaleScheduleModel {
  id: number;
  sessionNumber: number;
  scheduleDate: string;
  scheduleTime: string;
  status: string;
  saleItemId: number;
}

export interface SearchSaleScheduleModel extends BaseSearchModel {
  advanceFilter?: {
    branchId?: number;
  };
}

export interface BillDetailModel {
  scheduleAll: number;
  scheduleSuccess: number;
  scheduleRemaining: number;
  nextScheduleDate: string;
  nextScheduleTime: string;
  courseName: string;
}

const rootApi = "/sale-schedule";
const _SaleScheduleApi = () => {
  return {
    search: async (body: BaseSearchModel) => {
      return await api().post<BaseSearchModel, BaseSearchQueryModel>(
        `${rootApi}/search`,
        body,
      );
    },

    create: async (body: SaleScheduleModel) => {
      return await api().post<SaleScheduleModel, BaseQueryModel>(rootApi, body);
    },

    update: async (id: number, body: SaleScheduleModel) => {
      return await api().put<SaleScheduleModel, BaseQueryModel>(
        `${rootApi}/${id}`,
        body,
      );
    },

    delete: async (id: string) => {
      return await api().delete<unknown, BaseQueryModel>(`${rootApi}/${id}`);
    },

    getBillDetail: async (saleItemId: number) => {
      return await api().get(`${rootApi}/bill-detail/${saleItemId}`);
    },
  };
};

const _SaleScheduleKey = () => {
  return {
    search: "search-sale-schedule",
    create: "create-sale-schedule",
    update: "update-sale-schedule",
    delete: "delete-sale-schedule",
  };
};

export { _SaleScheduleApi, _SaleScheduleKey };
