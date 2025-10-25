import { useState, useCallback } from 'react';

/**
 * 通用表单状态管理Hook
 * 解决表单间的状态干扰问题
 * 
 * @param {Object} initialValues - 表单初始值
 * @returns {Array} [formState, handlers] - 表单状态和处理函数
 * 
 * @example
 * const [form, formHandlers] = useFormState({
 *   name: '',
 *   email: '',
 *   age: 0
 * });
 * 
 * // 更新字段
 * formHandlers.setField('name', 'John');
 * 
 * // 批量更新
 * formHandlers.setFields({ name: 'John', email: 'john@example.com' });
 * 
 * // 重置表单
 * formHandlers.reset();
 * 
 * // 重置为指定值
 * formHandlers.reset({ name: 'Default' });
 */
export const useFormState = (initialValues) => {
  const [formState, setFormState] = useState(() => ({ ...initialValues }));

  // 设置单个字段
  const setField = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // 批量设置字段
  const setFields = useCallback((values) => {
    setFormState((prev) => ({
      ...prev,
      ...values,
    }));
  }, []);

  // 重置表单
  const reset = useCallback((newValues = null) => {
    setFormState(newValues ? { ...initialValues, ...newValues } : { ...initialValues });
  }, [initialValues]);

  // 完整替换表单状态
  const replace = useCallback((newValues) => {
    setFormState({ ...newValues });
  }, []);

  return [
    formState,
    {
      setField,
      setFields,
      reset,
      replace,
    },
  ];
};

/**
 * 多表单状态管理Hook
 * 用于管理同一组件中的多个表单（如上传表单、编辑表单等）
 * 
 * @param {Object} formsConfig - 表单配置 { formName: initialValues }
 * @returns {Object} { forms, handlers } - 表单状态和处理函数
 * 
 * @example
 * const { forms, handlers } = useMultipleForms({
 *   upload: { title: '', file: null },
 *   edit: { title: '', description: '' }
 * });
 * 
 * // 访问表单
 * console.log(forms.upload, forms.edit);
 * 
 * // 更新表单
 * handlers.upload.setField('title', 'New Title');
 * 
 * // 重置表单
 * handlers.upload.reset();
 */
export const useMultipleForms = (formsConfig) => {
  const forms = {};
  const handlers = {};

  Object.keys(formsConfig).forEach((formName) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [formState, formHandlers] = useFormState(formsConfig[formName]);
    forms[formName] = formState;
    handlers[formName] = formHandlers;
  });

  return { forms, handlers };
};

export default useFormState;
