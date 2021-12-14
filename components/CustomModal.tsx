import { Button } from "@chakra-ui/button";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { ButtonProps } from "@chakra-ui/react";
import React from "react";

interface Props {
  title: string;
  buttonText?: string;
  withAction?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  isOpen?: boolean;
  isClosable?: boolean;
  actionButtonProps?: ButtonProps;
}

const CustomModal: React.FC<Props> = ({
  title,
  buttonText,
  isOpen,
  isClosable,
  withAction,
  children,
  actionButtonProps,
  onClick,
  onClose,
}) => {
  return (
    <Modal
      closeOnOverlayClick={isClosable}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <ModalOverlay />
      <ModalContent alignItems="center" shadow="lg" bg="#171717">
        <ModalHeader color="whiteAlpha.800">{title}</ModalHeader>
        {isClosable && <ModalCloseButton />}
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          {withAction && (
            <Button size="sm" onClick={onClick} {...actionButtonProps}>
              {buttonText}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose} colorScheme="red">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;
