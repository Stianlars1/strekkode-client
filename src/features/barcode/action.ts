import { createBarcode } from "@/utils/supabase/crud";

export const generateBarcode = async (
  _currentState: unknown,
  formData: FormData
) => {
  const barcode = formData.get("barcode") as string;
  if (!barcode) {
    return {
      isSuccess: false,
      barcodeValue: "",
      errorMessage: "Barcode value is required",
    };
  }
  return await createBarcode(barcode);
};
