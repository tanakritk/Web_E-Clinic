import ContentLayout from "@/layout/content-layout";
import { Button } from "@mui/material";
import PersonalInfo, { PersonalInfoForm } from "./components/personal-info";
import TreatmentHistory from "./components/treatment-history";
import { useNavigate, useParams } from "react-router-dom";
import { CancelButton } from "@/components/custom-element/icon-button";
import { CryptoHelper } from "@/helpers/encrypt-decrypt";
import { useLoading } from "@/context/loading-context";
import { useAlert } from "@/context/alert-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  _MasterCustomerApi,
  _MasterCustomerKey,
  SearchMasterCustomerModel,
} from "@/api/controller/master-customer";
import { useEffect, useState } from "react";

const PageCustomerInfo = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();
  const idDeCode = CryptoHelper.decrypt(decodeURIComponent(id || ""));
  const { setLoadingContext } = useLoading();
  const { setAlertContext } = useAlert();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<PersonalInfoForm>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Query: ข้อมูลลูกค้า ---
  const { data: customerData, isLoading } = useQuery({
    queryKey: [_MasterCustomerKey().search, idDeCode],
    queryFn: async () => {
      const payload: SearchMasterCustomerModel = {
        page: 1,
        limit: 1,
        filterOperator: "and",
        filter: [{ field: "id", operator: "=", value: idDeCode }],
      };
      try {
        const result = await _MasterCustomerApi().search(payload);
        return result?.data?.[0] ?? null;
      } catch (error: any) {
        setAlertContext({
          message: error?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า",
          type: "warning",
        });
        return null;
      }
    },
    enabled: !!idDeCode,
  });

  // sync customerData -> form เมื่อโหลดเสร็จ
  useEffect(() => {
    if (customerData) {
      setErrors({});
      setForm({
        title: customerData.title,
        firstname: customerData.firstname,
        surname: customerData.surname,
        nickname: customerData.nickname,
        phone: customerData.phone,
        phone2: customerData.phone2,
        birthday: customerData.birthday,
        idCardNumber: customerData.idCardNumber,
        address: customerData.address,
        lineId: customerData.lineId,
        facebook: customerData.facebook,
        source: customerData.source,
        tag: customerData.tag,
      });
    }
  }, [customerData]);

  useEffect(() => {
    setLoadingContext(isLoading);
  }, [setLoadingContext, isLoading]);

  // --- Mutation: อัปเดตข้อมูลลูกค้า ---
  const { mutate: updateCustomer, isPending } = useMutation({
    mutationFn: () => _MasterCustomerApi().update(Number(idDeCode), form),
    onSuccess: () => {
      setAlertContext({ message: "บันทึกข้อมูลสำเร็จ", type: "success" });
      queryClient.invalidateQueries({
        queryKey: [_MasterCustomerKey().search],
      });
      navigate(-1);
    },
    onError: (error: any) => {
      setAlertContext({
        message: error?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        type: "warning",
      });
    },
  });

  useEffect(() => {
    setLoadingContext(isPending);
  }, [isPending]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.firstname?.trim()) newErrors.firstname = "กรุณาระบุชื่อ";
    if (!form.surname?.trim()) newErrors.surname = "กรุณาระบุนามสกุล";
    if (!form.phone?.trim()) {
      newErrors.phone = "กรุณาระบุเบอร์ติดต่อ";
    } else if (!/^0\d{9}$/.test(form.phone.trim())) {
      newErrors.phone = "รูปแบบเบอร์ติดต่อไม่ถูกต้อง (เช่น 0812345678)";
    }

    if (!form.phone2?.trim()) {
      newErrors.phone2 = "กรุณาระบุเบอร์ติดต่อญาติ";
    } else if (!/^0\d{9}$/.test(form.phone2.trim())) {
      newErrors.phone2 = "รูปแบบเบอร์ติดต่อญาติไม่ถูกต้อง (เช่น 0812345678)";
    }
    
    if (!form.source?.trim()) newErrors.source = "กรุณาระบุแหล่งที่มา";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      updateCustomer();
    }
  };

  return (
    <ContentLayout titlePage="ข้อมูลลูกค้า">
      <div className="mt-6 flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="w-full lg:w-[380px] shrink-0">
          <PersonalInfo data={form} onChange={setForm} errors={errors} setErrors={setErrors} />
        </div>
        <div className="w-full lg:flex-1">
          <TreatmentHistory customerId={idDeCode} />
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <CancelButton onClick={() => navigate(-1)}>ยกเลิก</CancelButton>
        <Button
          variant="contained"
          disabled={isPending}
          onClick={handleSave}
        >
          บันทึกข้อมูล
        </Button>
      </div>
    </ContentLayout>
  );
};

export default PageCustomerInfo;
