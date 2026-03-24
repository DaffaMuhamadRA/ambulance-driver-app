import { useState } from "react"

export type ModalType = "confirm" | "alert"

export interface ModalState {
  isOpen: boolean
  type: ModalType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonClass?: string
  alertType?: "info" | "success" | "warning" | "error"
  onConfirm?: () => void
}

export function useModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    confirmText: "Ya",
    cancelText: "Batal",
    confirmButtonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
  })

  const openConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string,
    confirmButtonClass?: string
  ) => {
    setModalState({
      isOpen: true,
      type: "confirm",
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass,
      onConfirm
    })
  }

  const openAlertModal = (
    title: string,
    message: string,
    type?: "info" | "success" | "warning" | "error"
  ) => {
    setModalState({
      isOpen: true,
      type: "alert",
      title,
      message,
      alertType: type
    })
  }

  const closeModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }))
  }

  return {
    modalState,
    openConfirmModal,
    openAlertModal,
    closeModal
  }
}
