import api from "../axios-service";
import {
  BaseQueryModel,
  BaseSearchModel,
  BaseSearchQueryModel,
} from "../interface";

export interface MasterCoursesModel {
  id?: number;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  numberOfTimes?: number;
  commission?: number;
  isActive?: boolean;
  coursesProduct?: {
    productId: number;
    quantity: number;
  }[];
}

const rootApi = "/master-courses";
const _MasterCoursesApi = () => {
  return {
    search: async (body: BaseSearchModel) => {
      return await api().post<BaseSearchModel, BaseSearchQueryModel>(
        `${rootApi}/search`,
        body,
      );
    },

    create: async (body: MasterCoursesModel) => {
      return await api().post<MasterCoursesModel, BaseQueryModel>(
        rootApi,
        body,
      );
    },

    update: async (id: number, body: MasterCoursesModel) => {
      return await api().put<MasterCoursesModel, BaseQueryModel>(
        `${rootApi}/${id}`,
        body,
      );
    },

    changeActiveStatus: async (id: number, isActive: boolean) => {
      return await api().put<MasterCoursesModel, BaseQueryModel>(
        `${rootApi}/change-active/${id}`,
        { isActive },
      );
    },

    delete: async (id: string) => {
      return await api().delete<unknown, BaseQueryModel>(`${rootApi}/${id}`);
    },
  };
};

const _MasterCoursesKey = () => {
  return {
    search: "search-master-course",
    create: "create-master-course",
    update: "update-master-course",
    delete: "delete-master-course",
  };
};

export { _MasterCoursesApi, _MasterCoursesKey };
