// components/LanguageToggle.js
import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet } from 'react-native';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(i18n.language || 'en');
  const [items, setItems] = useState([
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
    { label: 'Français', value: 'fr' },
    { label: '中文', value: 'zh' },
    { label: 'हिन्दी', value: 'hi' },
    { label: 'العربية', value: 'ar' },
    { label: 'Português', value: 'pt' },
    { label: '한국어', value: 'ko' },
    { label: 'Русский', value: 'ru' },
    { label: 'Tiếng Việt', value: 'vi' },
  ]);

  // Sync language change with i18n
  useEffect(() => {
    i18n.changeLanguage(value);
  }, [value]);

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue} // ✅ fixed to directly call state
        setItems={setItems}
        placeholder="Select Language"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropDownBox}
        zIndex={1000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
    zIndex: 1000,
  },
  dropdown: {
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  dropDownBox: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
});

export default LanguageToggle;
