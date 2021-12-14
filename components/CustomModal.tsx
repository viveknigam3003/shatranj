import { Button } from "@chakra-ui/button";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from "@chakra-ui/modal";
import { ButtonProps, HStack } from "@chakra-ui/react";
import React from "react";

export interface CustomModalProps {
  title: string;
  buttonText?: string;
  withAction?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  isOpen?: boolean;
  isClosable?: boolean;
  actionButtonProps?: ButtonProps;
}

const CustomModal: React.FC<CustomModalProps> = ({
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
          <HStack>
            {withAction && (
              <Button size="sm" onClick={onClick} {...actionButtonProps}>
                {buttonText}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              colorScheme="red"
            >
              Cancel
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;
