import React from 'react';
import type { RootScreenProps } from '../../navigation/types';
import { useAddressStore } from '../../store/useAddressStore';
import { AddressScreen } from './AddressScreen';

export const AddressManageScreen: React.FC<RootScreenProps<'AddressManage'>> = ({ navigation }) => {
  const addresses = useAddressStore((state) => state.addresses);
  const createAddress = useAddressStore((state) => state.createAddress);
  const updateAddress = useAddressStore((state) => state.updateAddress);
  const deleteAddress = useAddressStore((state) => state.deleteAddress);
  const setDefaultAddress = useAddressStore((state) => state.setDefaultAddress);

  return (
    <AddressScreen
      onBack={() => navigation.goBack()}
      addresses={addresses}
      onCreate={createAddress}
      onUpdate={updateAddress}
      onDelete={deleteAddress}
      onSetDefault={setDefaultAddress}
    />
  );
};
