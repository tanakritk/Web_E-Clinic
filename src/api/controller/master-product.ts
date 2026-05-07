import apiformdata from "../axios-formdata-service";
import api from "../axios-service";
import {
  BaseQueryModel,
  BaseSearchModel,
  BaseSearchQueryModel,
} from "../interface";

export interface MasterProductModel {
  id?: number;
  code?: string;
  name?: string;
  price?: string;
  fileName?: string;
  filePath?: string;
  fileOriginalName?: string;
  fileType?: string;
  isActive?: boolean;
  files?: File;
}

export interface MasterProductSearchForSaleModel extends MasterProductModel {
  base64: string;
}

const rootApi = "/master-product";
const _MasterProductApi = () => {
  return {
    search: async (body: BaseSearchModel) => {
      return await api().post<BaseSearchModel, BaseSearchQueryModel>(
        `${rootApi}/search`,
        body,
      );
    },

    create: async (body: MasterProductModel) => {
      return await apiformdata().post<MasterProductModel, BaseQueryModel>(
        rootApi,
        body,
      );
    },

    update: async (id: number, body: MasterProductModel) => {
      return await apiformdata().put<MasterProductModel, BaseQueryModel>(
        `${rootApi}/${id}`,
        body,
      );
    },

    changeActiveStatus: async (id: number, isActive: boolean) => {
      return await api().put<MasterProductModel, BaseQueryModel>(
        `${rootApi}/change-active/${id}`,
        { isActive },
      );
    },

    delete: async (id: string) => {
      return await api().delete<unknown, BaseQueryModel>(`${rootApi}/${id}`);
    },

    SearchForSale: async (body: BaseSearchModel) => {
      return await api().post<BaseSearchModel, BaseSearchQueryModel>(
        `${rootApi}/search-for-sele`,
        body,
      );
    },
  };
};

const _MasterProductKey = () => {
  return {
    search: "search-master-product",
    create: "create-master-product",
    update: "update-master-product",
    delete: "delete-master-product",
  };
};

export { _MasterProductApi, _MasterProductKey };
