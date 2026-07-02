import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Trash2 } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomSwitch from './CustomSwitch';

interface CustomBottomSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  useApiResponse: boolean;
  toggleUseApiResponse: () => void;
  deleteChat?: () => void;
  forceNextFail?: boolean;
  setForceNextFail?: (v: boolean) => void;
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  bottomSheetModalRef,
  useApiResponse,
  toggleUseApiResponse,
  deleteChat,
  forceNextFail,
  setForceNextFail
}) => {
  const snapPoints = useMemo(() => ['40%', '85%'], []);
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleDeleteChat = useCallback(() => {
    if (!deleteChat) return;

    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteChat();
            bottomSheetModalRef.current?.close();
          }
        }
      ]
    );
  }, [deleteChat, bottomSheetModalRef]);

  const handleForceNextFail = useCallback(() => {
    setForceNextFail && setForceNextFail(!forceNextFail);
  }, [forceNextFail, setForceNextFail]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      handleIndicatorStyle={{ backgroundColor: '#555555', width: 40 }}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#1F1F1F' }}
    >
      <BottomSheetView className="flex-1 p-4" style={{ paddingBottom: insets.bottom }}>
        <Text className="text-xl font-bold text-white mb-6">Settings</Text>

        <TouchableOpacity
          onPress={toggleUseApiResponse}
          activeOpacity={0.7}
          className="flex-row justify-between items-center mb-4">
          <Text className="text-base text-white">Use Gemini</Text>
          <CustomSwitch
            value={useApiResponse}
            onValueChange={toggleUseApiResponse}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleForceNextFail}
          activeOpacity={0.7}
          className="flex-row justify-between items-center mb-4">
          <Text className="text-base text-white">Force Next Message to Fail</Text>
          <CustomSwitch
            value={forceNextFail || false}
            onValueChange={(value) => setForceNextFail && setForceNextFail(value)}
          />
        </TouchableOpacity>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base text-white">Delete Chat</Text>
          <TouchableOpacity
            className="p-2"
            onPress={handleDeleteChat}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color="#FF4545" />
          </TouchableOpacity>
        </View>

      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default CustomBottomSheet;
