"use server";
import {
  BarcodeType,
  CreateBarcodeReturnType,
  GetBarcodeInsights,
  TotalBarcodesGeneratedType,
} from "@/types/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { evalError } from "../actions";
import { createSupabase } from "./supaConfig";

export const getBarcodeInsights = async (): Promise<GetBarcodeInsights> => {
  const supabase = createSupabase();
  const {
    data,
    error: supabaseError,
    status,
    statusText,
  } = await supabase.from("strekkoder").select("*");
  const error = evalError(supabaseError);
  const barcodeInsights = data ? (data as BarcodeType[]) : null;
  return { data: barcodeInsights, error: error, status, statusText };
};
export const getTotalBarcodesGenerated =
  async (): Promise<TotalBarcodesGeneratedType> => {
    const supabase = createSupabase();
    const {
      data,
      error: supabaseError,
      status,
      statusText,
    } = await supabase.rpc("get_total_barcodes_generated");
    const error = evalError(supabaseError);
    const totalBarcodes = data ? (data as number) : null;
    return { data: totalBarcodes, error, status, statusText };
  };

// POST
const schema = z.object({
  barcodeValue: z.string({
    invalid_type_error: "Invalid Email",
  }),
});

export const createBarcode = async (
  barcodeValue: string
): Promise<CreateBarcodeReturnType> => {
  const supabase = createSupabase();
  const {
    data,
    error: supabaseError,
    status,
    statusText,
  } = await supabase.rpc("create_barcode", { arg_barcode: barcodeValue });

  const error = evalError(supabaseError);
  if (error) {
    return {
      isSuccess: false,
      barcodeValue: barcodeValue,
      errorMessage: error,
    };
  }
  // Cache invalidate to update UI in background for the total generated count insights
  revalidatePath("/");

  return {
    isSuccess: true,
    barcodeValue: barcodeValue,
    errorMessage: undefined,
  };
};
export const updateBarcodeDownloadedCount = async (barcodeValue: string) => {
  const supabase = createSupabase();
  const {
    data,
    error: supabaseError,
    status,
  } = await supabase.rpc("update_downloaded_count", {
    arg_barcode_value: barcodeValue,
  });

  const error = evalError(supabaseError);
  if (error) {
    return false;
  }
  return true;
};
