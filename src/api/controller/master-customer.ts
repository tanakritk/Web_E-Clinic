import api from "../axios-service";
import {
  BaseQueryModel,
  BaseSearchModel,
  BaseSearchQueryModel,
} from "../interface";

export interface MasterCustomerModel {
  id?: number;
  code?: string;
  title?: string;
  firstname?: string;
  surname?: string;
  nickname?: string;
  phone?: string;
  phone2?: string;
  birthday?: string;
  idCardNumber?: string;
  address?: string;
  lineId?: string;
  facebook?: string;
  source?: string;
  tag?: string;
}

export interface SearchMasterCustomerModel extends BaseSearchModel {
  advanceFilter?: {
    isNew?: boolean;
  };
}

const rootApi = "/master-customer";
const _MasterCustomerApi = () => {
  return {
    search: async (body: SearchMasterCustomerModel) => {
      return await api().post<SearchMasterCustomerModel, BaseSearchQueryModel>(
        `${rootApi}/search`,
        body,
      );
    },

    create: async (body: MasterCustomerModel) => {
      return await api().post<MasterCustomerModel, BaseQueryModel>(
        rootApi,
        body,
      );
    },

    update: async (id: number, body: MasterCustomerModel) => {
      return await api().put<MasterCustomerModel, BaseQueryModel>(
        `${rootApi}/${id}`,
        body,
      );
    },

    delete: async (id: string) => {
      return await api().delete<unknown, BaseQueryModel>(`${rootApi}/${id}`);
    },
  };
};

const _MasterCustomerKey = () => {
  return {
    search: "search-master-customer",
    create: "create-master-customer",
    update: "update-master-customer",
    delete: "delete-master-customer",
  };
};

export { _MasterCustomerApi, _MasterCustomerKey };
