
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define a type for the roles to ensure consistent typing
type UserRole = 'admin' | 'business' | 'user';

export async function redirectBasedOnRole(userId: string, navigate: (path: string, options: { replace: boolean }) => void) {
  try {
    console.log("Verificando papel para usuário ID:", userId);
    
    // Método direto: verificar metadados do usuário primeiro
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.role === 'admin') {
        console.log("Admin encontrado nos metadados do usuário");
        navigate('/admin', { replace: true });
        return;
      }
    } catch (metaErr) {
      console.error("Erro ao verificar metadados:", metaErr);
    }
    
    // Verificar direto na tabela de profiles sem usar RPC
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
        
      if (!error && data) {
        console.log("Papel do usuário obtido diretamente da tabela:", data.role);
        if (data.role === 'admin') {
          console.log("Papel admin detectado, redirecionando para página admin");
          navigate('/admin', { replace: true });
          return;
        } else if (data.role === 'business') {
          console.log("Papel business detectado, redirecionando para owner page");
          await checkAndCreateLaundryIfNeeded(userId, navigate);
          return;
        }
      } else {
        console.error("Erro ao verificar papel diretamente:", error);
      }
    } catch (directErr) {
      console.error("Exceção ao verificar papel diretamente:", directErr);
    }
    
    // Verificar se o usuário é proprietário de alguma lavanderia
    try {
      const { data: laundryCheck, error: laundryError } = await supabase
        .from('laundries')
        .select('id')
        .eq('owner_id', userId)
        .limit(1);

      if (laundryError) {
        console.error("Erro ao verificar lavanderias:", laundryError);
      } else if (laundryCheck && laundryCheck.length > 0) {
        console.log(`Usuário ${userId} é proprietário de lavanderia, lavanderia encontrada:`, laundryCheck[0]);
        // Atualizar papel do usuário para business se ele possui uma lavanderia
        await updateUserRoleIfNeeded(userId, 'business');
        console.log("Redirecionando para dashboard do proprietário");
        navigate('/owner', { replace: true });
        return;
      } else {
        console.log(`Usuário ${userId} não possui lavanderias associadas`);
      }
    } catch (error) {
      console.error("Erro ao verificar lavanderias:", error);
    }

    console.log("Nenhum papel específico detectado, redirecionando para home");
    navigate('/', { replace: true });
  } catch (error) {
    console.error("Erro em redirectBasedOnRole:", error);
    toast.error("Erro no redirecionamento baseado no papel do usuário");
    // Fallback para página inicial
    navigate('/', { replace: true });
  }
}

async function updateUserRoleIfNeeded(userId: string, role: UserRole) {
  try {
    // Verificar papel atual sem usar RPC para evitar recursão
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar papel atual:", error);
      return;
    }

    if (data?.role !== role) {
      console.log(`Atualizando papel do usuário ${userId} de ${data?.role || 'null'} para ${role}`);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (updateError) {
        console.error("Erro ao atualizar papel:", updateError);
      } else {
        console.log("Papel atualizado com sucesso para:", role);
      }
    }
  } catch (error) {
    console.error("Erro em updateUserRoleIfNeeded:", error);
  }
}

async function checkAndCreateLaundryIfNeeded(userId: string, navigate: (path: string, options: { replace: boolean }) => void) {
  try {
    const { data: laundryCheck, error: laundryError } = await supabase
      .from('laundries')
      .select('id')
      .eq('owner_id', userId)
      .limit(1);
    
    if (laundryError) {
      console.error("Erro ao verificar lavanderias:", laundryError);
    }
    
    if (laundryCheck && laundryCheck.length > 0) {
      console.log(`Usuário ${userId} já possui lavanderias:`, laundryCheck);
      navigate('/owner', { replace: true });
      return;
    } else {
      console.log("Usuário business não tem lavanderias. Criando uma lavanderia teste...");
      
      try {
        // Criar uma lavanderia teste para este usuário business
        const testLaundryName = `Lavanderia Teste ${Math.floor(Math.random() * 1000)}`;
        const { data: newLaundry, error: createError } = await supabase
          .from('laundries')
          .insert({
            name: testLaundryName,
            address: 'Rua Teste, 123, Cidade Teste',
            contact_email: 'test@example.com',
            contact_phone: '(11) 99999-9999',
            owner_id: userId,
            status: 'active'
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Erro ao criar lavanderia teste:", createError);
          toast.error("Erro ao criar lavanderia de teste");
        } else if (newLaundry) {
          console.log("Lavanderia teste criada com sucesso:", newLaundry);
          toast.success("Lavanderia de teste criada com sucesso");
        }
        
        navigate('/owner', { replace: true });
        return;
      } catch (error) {
        console.error("Erro na criação de lavanderia teste:", error);
        toast.error("Erro ao criar lavanderia de teste");
      }
    }
    
    navigate('/owner', { replace: true });
  } catch (error) {
    console.error("Erro ao verificar lavanderias:", error);
    // Ainda redirecionar para página do proprietário, eles podem criar lavanderias lá
    navigate('/owner', { replace: true });
  }
}
