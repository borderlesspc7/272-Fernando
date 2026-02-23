/**
 * EXEMPLO DE USO DO SISTEMA DE TOAST
 * 
 * Este arquivo demonstra como usar o sistema de notificações toast
 * em diferentes cenários da aplicação.
 */

import { toast } from "../components/ui/Toast";

// ✅ EXEMPLO 1: Toast de Sucesso
export const showSuccessExample = () => {
  toast.success("Cliente cadastrado com sucesso!");
};

// ❌ EXEMPLO 2: Toast de Erro
export const showErrorExample = () => {
  toast.error("Erro ao salvar os dados. Tente novamente.");
};

// ⏳ EXEMPLO 3: Toast de Loading (Promise)
export const showLoadingExample = async () => {
  const myPromise = new Promise((resolve) => {
    setTimeout(() => resolve({ name: "Cliente" }), 2000);
  });

  toast.promise(
    myPromise,
    {
      loading: "Salvando cliente...",
      success: "Cliente salvo com sucesso!",
      error: "Erro ao salvar cliente",
    }
  );
};

// ℹ️ EXEMPLO 4: Toast Personalizado
export const showCustomExample = () => {
  toast("Nova notificação recebida", {
    icon: "📬",
    duration: 6000,
  });
};

// 🎨 EXEMPLO 5: Toast com Ação
export const showActionExample = () => {
  toast.success("Cliente deletado", {
    duration: 5000,
  });
};

// EXEMPLO DE USO EM UM SERVICE:
export const exampleServiceWithToast = {
  async createClient(data: any) {
    try {
      // Mostra loading
      const promise = fetch("/api/clients", {
        method: "POST",
        body: JSON.stringify(data),
      });

      await toast.promise(promise, {
        loading: "Criando cliente...",
        success: "Cliente criado com sucesso!",
        error: "Falha ao criar cliente",
      });

      return await promise;
    } catch (error) {
      // Toast de erro já foi mostrado pelo promise
      throw error;
    }
  },

  async deleteClient(id: string) {
    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      toast.success("Cliente excluído com sucesso!");
    } catch (error) {
      toast.error("Não foi possível excluir o cliente");
      throw error;
    }
  },
};

// EXEMPLO DE USO EM UM COMPONENTE:
export function ClientFormExample() {
  const handleSubmit = async (data: any) => {
    try {
      const promise = exampleServiceWithToast.createClient(data);

      // Opção 1: Usar toast.promise
      await toast.promise(promise, {
        loading: "Salvando...",
        success: "Salvo com sucesso!",
        error: "Erro ao salvar",
      });
    } catch (error) {
      // Erro já foi tratado pelo toast
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await exampleServiceWithToast.deleteClient(id);
      // Toast de sucesso já foi mostrado no service
    } catch (error) {
      // Toast de erro já foi mostrado no service
    }
  };

  return null; // Componente de exemplo
}
