// types/vue-toaster.d.ts
declare module '@meforma/vue-toaster' {
  import { Plugin } from 'vue';
  const ToasterPlugin: Plugin;
  export function useToaster(): {
    success(message: string, options?: any): void;
    error(message: string, options?: any): void;
    info(message: string, options?: any): void;
    warning(message: string, options?: any): void;
  };
  export default ToasterPlugin;
}
