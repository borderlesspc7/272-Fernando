import { Timestamp } from "firebase/firestore";

/**
 * Remove campos undefined de um objeto
 * Firestore não aceita valores undefined
 */
export const removeUndefinedFields = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date || obj instanceof Timestamp) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => removeUndefinedFields(item));
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = removeUndefinedFields(obj[key]);
      }
    }
    
    return cleaned;
  }

  return obj;
};

/**
 * Converte strings vazias em null (mais semântico que string vazia)
 */
export const emptyStringsToNull = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return obj.trim() === '' ? null : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => emptyStringsToNull(item));
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    
    for (const key in obj) {
      cleaned[key] = emptyStringsToNull(obj[key]);
    }
    
    return cleaned;
  }

  return obj;
};

/**
 * Prepara dados para salvar no Firestore
 * Remove undefined e opcionalmente converte strings vazias
 */
export const prepareForFirestore = (data: any, convertEmptyStrings: boolean = false): any => {
  let prepared = removeUndefinedFields(data);
  
  if (convertEmptyStrings) {
    prepared = emptyStringsToNull(prepared);
  }
  
  return prepared;
};
