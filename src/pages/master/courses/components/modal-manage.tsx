import DialogCustom from "@/components/custom-element/dialog-custom";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  FormHelperText,
} from "@mui/material";
import { useState, useEffect } from "react";
import { MasterCoursesModel } from "@/api/controller/master-courses";
import _DropdownApi, { DropdownModel } from "@/api/controller/dropdown";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";

interface ModalManageProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: MasterCoursesModel, mode: "create" | "update") => void;
  initialData?: MasterCoursesModel | null;
  mode: "create" | "update";
}

const ModalManage = ({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}: ModalManageProps) => {
  const [form, setForm] = useState<any>({
    name: "",
    description: "",
    price: "",
    numberOfTimes: "",
    commission: "",
    isActive: true,
    coursesProduct: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productOptions, setProductOptions] = useState<DropdownModel[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res: any = await _DropdownApi().product();
        if (res?.data) {
          setProductOptions(res.data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (open) {
      setErrors({});
      if (mode === "update" && initialData) {
        setForm({
          id: initialData.id,
          code: initialData.code,
          name: initialData.name || "",
          description: initialData.description || "",
          price: initialData.price || "",
          numberOfTimes: initialData.numberOfTimes || "",
          commission: initialData.commission || "",
          isActive: initialData.isActive ?? true,
          coursesProduct: (initialData as any).courses_product
            ? (initialData as any).courses_product.map((item: any) => ({
                productId: item.mas_product?.id,
                quantity: Number(item.quantity) || 1,
              }))
            : initialData.coursesProduct || [],
        });
      } else {
        setForm({
          name: "",
          description: "",
          price: "",
          numberOfTimes: "",
          commission: "",
          isActive: true,
          coursesProduct: [],
        });
      }
    }
  }, [open, mode, initialData]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const newCoursesProduct = [...(form.coursesProduct || [])];
    newCoursesProduct[index] = { ...newCoursesProduct[index], [field]: value };
    handleChange("coursesProduct", newCoursesProduct);

    if (errors[`coursesProduct_${index}_${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`coursesProduct_${index}_${field}`]: "",
      }));
    }
  };

  const addProductRow = () => {
    const newCoursesProduct = [
      ...(form.coursesProduct || []),
      { productId: 0, quantity: 1 },
    ];
    handleChange("coursesProduct", newCoursesProduct);
  };

  const removeProductRow = (index: number) => {
    const newCoursesProduct = [...(form.coursesProduct || [])];
    newCoursesProduct.splice(index, 1);
    handleChange("coursesProduct", newCoursesProduct);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name?.trim()) newErrors.name = "กรุณาระบุชื่อคอร์ส";
    if (!form.price?.toString().trim()) newErrors.price = "กรุณาระบุราคา";
    if (!form.numberOfTimes?.toString().trim())
      newErrors.numberOfTimes = "กรุณาระบุจำนวนครั้ง";

    if (form.coursesProduct && form.coursesProduct.length > 0) {
      form.coursesProduct.forEach((prod: any, idx: number) => {
        if (!prod.productId) {
          newErrors[`coursesProduct_${idx}_productId`] = "กรุณาเลือกสินค้า";
        }
        if (!prod.quantity || Number(prod.quantity) <= 0) {
          newErrors[`coursesProduct_${idx}_quantity`] = "ระบุจำนวน";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const payload: MasterCoursesModel = {
        ...form,
        price: Number(form.price),
        numberOfTimes: Number(form.numberOfTimes),
        commission: form.commission ? Number(form.commission) : 0,
      };
      onSubmit(payload, mode);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <DialogCustom
      status={open}
      returnOnClose={handleClose}
      hideHeader={true}
      size="sm"
    >
      <div className="p-2 sm:p-4">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {mode === "update" ? "แก้ไขข้อมูลคอร์ส" : "เพิ่มคอร์สใหม่"}
            </h2>
            <p className="text-sm text-gray-500 ">
              {mode === "update"
                ? "แก้ไขรายละเอียดพื้นฐานสำหรับคอร์ส"
                : "ระบุรายละเอียดพื้นฐานสำหรับคอร์สใหม่"}
            </p>
          </div>
          <div className="bg-pink-100 p-3 rounded-2xl flex items-center justify-center text-primary relative">
            <FaceRetouchingNaturalIcon />
            <AddIcon
              sx={{
                fontSize: 14,
                position: "absolute",
                bottom: 4,
                right: 4,
                fontWeight: "bold",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="block text-sm font-bold text-gray-700 mb-2 ">
              รหัสคอร์ส
            </p>
            <TextField
              disabled
              value={form.code || "ระบบจะสร้างให้อัตโนมัติ"}
              fullWidth
              variant="outlined"
            />
          </div>
          <div>
            <p className="block text-sm font-bold text-gray-700 mb-2 ">
              ชื่อคอร์ส
            </p>
            <TextField
              placeholder="ชื่อคอร์ส"
              fullWidth
              variant="outlined"
              value={form.name || ""}
              onChange={(e) => {
                handleChange("name", e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              error={!!errors.name}
              helperText={errors.name}
              autoComplete="off"
            />
          </div>
          <div>
            <p className="block text-sm font-bold text-gray-700 mb-2 ">
              รายละเอียดคอร์ส
            </p>
            <TextField
              placeholder="รายละเอียดคอร์ส"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={form.description || ""}
              onChange={(e) => {
                handleChange("description", e.target.value);
              }}
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-2 ">
                ราคา
              </p>
              <TextField
                placeholder="ราคา"
                fullWidth
                variant="outlined"
                type="number"
                value={form.price || ""}
                onChange={(e) => {
                  handleChange("price", e.target.value);
                  if (errors.price) setErrors({ ...errors, price: "" });
                }}
                error={!!errors.price}
                helperText={errors.price}
                autoComplete="off"
              />
            </div>
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-2 ">
                จำนวนครั้ง
              </p>
              <TextField
                placeholder="จำนวนครั้ง"
                fullWidth
                variant="outlined"
                type="number"
                value={form.numberOfTimes || ""}
                onChange={(e) => {
                  handleChange("numberOfTimes", e.target.value);
                  if (errors.numberOfTimes)
                    setErrors({ ...errors, numberOfTimes: "" });
                }}
                error={!!errors.numberOfTimes}
                helperText={errors.numberOfTimes}
                autoComplete="off"
              />
            </div>
            <div>
              <p className="block text-sm font-bold text-gray-700 mb-2 ">
                คอมมิสชั่น (%)
              </p>
              <TextField
                placeholder="คอมมิสชั่น"
                fullWidth
                variant="outlined"
                type="number"
                value={form.commission || ""}
                onChange={(e) => {
                  handleChange("commission", e.target.value);
                  if (errors.commission)
                    setErrors({ ...errors, commission: "" });
                }}
                error={!!errors.commission}
                helperText={errors.commission}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="block text-sm font-bold text-gray-700">
                สินค้าในคอร์ส
              </p>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={addProductRow}
              >
                เพิ่มสินค้า
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {(form.coursesProduct || []).map((prod: any, idx: number) => (
                <div key={idx} className="flex gap-2 items-start">
                  <FormControl
                    fullWidth
                    variant="outlined"
                    size="small"
                    error={!!errors[`coursesProduct_${idx}_productId`]}
                  >
                    <Select
                      value={prod.productId || ""}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "productId",
                          Number(e.target.value),
                        )
                      }
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <em>เลือกสินค้า</em>
                      </MenuItem>
                      {productOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors[`coursesProduct_${idx}_productId`] && (
                      <FormHelperText>
                        {errors[`coursesProduct_${idx}_productId`]}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <TextField
                    placeholder="จำนวน"
                    variant="outlined"
                    size="small"
                    type="number"
                    sx={{ width: "120px" }}
                    value={prod.quantity || ""}
                    onChange={(e) =>
                      handleProductChange(
                        idx,
                        "quantity",
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    error={!!errors[`coursesProduct_${idx}_quantity`]}
                    helperText={errors[`coursesProduct_${idx}_quantity`]}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeProductRow(idx)}
                  >
                    <RemoveIcon />
                  </IconButton>
                </div>
              ))}
              {(!form.coursesProduct || form.coursesProduct.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed">
                  ยังไม่มีสินค้าในคอร์ส
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-10">
          <Button
            size="large"
            variant="outlined"
            onClick={handleClose}
            fullWidth
          >
            ยกเลิก
          </Button>
          <Button
            size="large"
            variant="contained"
            fullWidth
            onClick={handleSave}
          >
            บันทึกข้อมูล
          </Button>
        </div>
      </div>
    </DialogCustom>
  );
};

export default ModalManage;
