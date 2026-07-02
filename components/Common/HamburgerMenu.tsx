import { EllipsisVertical } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';

interface HamburgerMenuProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  onPress, 
  color = 'white', 
  size = 24 
}) => {
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
     <EllipsisVertical color={color} size={size}/>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HamburgerMenu;
