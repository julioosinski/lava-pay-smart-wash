
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./schema";
import { Loader2, AlertCircle } from "lucide-react";
import { BusinessOwner } from "@/types";

interface LaundryFormContentProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => void;
  mode: "create" | "edit";
  isLoading: boolean;
  businessOwners?: BusinessOwner[];
}

export function LaundryFormContent({ form, onSubmit, mode, isLoading, businessOwners = [] }: LaundryFormContentProps) {
  console.log("LaundryFormContent - businessOwners:", businessOwners);
  
  const handleOwnerChange = (ownerId: string) => {
    const selectedOwner = businessOwners.find(owner => owner.id === ownerId);
    if (selectedOwner) {
      // Auto-fill contact information
      form.setValue('contact_email', selectedOwner.email || '');
      form.setValue('contact_phone', selectedOwner.phone || '');
    }
  };

  // Set first business owner as default when list loads and there's no selected owner
  useEffect(() => {
    if (businessOwners.length > 0 && !form.getValues('owner_id') && mode === 'create') {
      const firstOwner = businessOwners[0];
      form.setValue('owner_id', firstOwner.id);
      
      // Also set the contact information
      form.setValue('contact_email', firstOwner.email || '');
      form.setValue('contact_phone', firstOwner.phone || '');
    }
  }, [businessOwners, form, mode]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Lavanderia</FormLabel>
              <FormControl>
                <Input placeholder="Nome da lavanderia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="owner_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Proprietário
                {businessOwners.length === 0 && !isLoading && (
                  <span className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Cadastre proprietários primeiro
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleOwnerChange(value);
                  }}
                  disabled={businessOwners.length === 0 || isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um proprietário" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessOwners.length === 0 ? (
                      <SelectItem value="none" disabled>
                        {isLoading ? "Carregando proprietários..." : "Nenhum proprietário disponível"}
                      </SelectItem>
                    ) : (
                      businessOwners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.name || owner.email || `ID: ${owner.id.slice(0, 8)}...`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Rua, número, complemento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email de Contato</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone de Contato</FormLabel>
              <FormControl>
                <Input placeholder="(99) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading || businessOwners.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Criando..." : "Salvando..."}
              </>
            ) : (
              mode === "create" ? "Criar" : "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
