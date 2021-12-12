import { useToast, UseToastOptions } from "@chakra-ui/react";
import { uid } from "../utils";

export const useCustomToast = () => {
  const toast = useToast();

  const createToast = (
    title: string,
    status: "error" | "info" | "warning" | "success",
    description = "",
    id = uid(),
    options?: UseToastOptions
  ) => {
    if (!toast.isActive(id)) {
      toast({
        id,
        title,
        status,
        description,
        variant: "subtle",
        duration: 5000,
        isClosable: true,
        ...options,
      });
    }
  };

  return { toast, createToast };
};
