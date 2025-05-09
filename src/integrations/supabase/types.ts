export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      address_uploads: {
        Row: {
          created_at: string
          error_message: string | null
          file_name: string
          file_path: string
          id: string
          processed_count: number | null
          status: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_name: string
          file_path: string
          id?: string
          processed_count?: number | null
          status?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_name?: string
          file_path?: string
          id?: string
          processed_count?: number | null
          status?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      esp32_settings: {
        Row: {
          created_at: string
          id: string
          laundry_id: string
          mqtt_broker: string | null
          mqtt_password: string | null
          mqtt_username: string | null
          updated_at: string
          wifi_password: string | null
          wifi_ssid: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          laundry_id: string
          mqtt_broker?: string | null
          mqtt_password?: string | null
          mqtt_username?: string | null
          updated_at?: string
          wifi_password?: string | null
          wifi_ssid?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          laundry_id?: string
          mqtt_broker?: string | null
          mqtt_password?: string | null
          mqtt_username?: string | null
          updated_at?: string
          wifi_password?: string | null
          wifi_ssid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esp32_settings_laundry_id_fkey"
            columns: ["laundry_id"]
            isOneToOne: true
            referencedRelation: "laundries"
            referencedColumns: ["id"]
          },
        ]
      }
      laundries: {
        Row: {
          address: string
          contact_email: string
          contact_phone: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address: string
          contact_email: string
          contact_phone: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      machines: {
        Row: {
          created_at: string
          current_payment_id: string | null
          current_session_start: string | null
          elgin_terminal_id: string | null
          esp32_id: string | null
          esp32_password: string | null
          expected_end_time: string | null
          id: string
          laundry_id: string
          machine_number: number | null
          machine_serial: string
          mercadopago_terminal_id: string | null
          mqtt_broker: string | null
          mqtt_password: string | null
          mqtt_username: string | null
          price: number
          status: string | null
          stone_code: string | null
          stone_terminal_id: string | null
          store_id: string
          time_minutes: number
          type: string
          updated_at: string
          wifi_password: string | null
          wifi_ssid: string | null
        }
        Insert: {
          created_at?: string
          current_payment_id?: string | null
          current_session_start?: string | null
          elgin_terminal_id?: string | null
          esp32_id?: string | null
          esp32_password?: string | null
          expected_end_time?: string | null
          id?: string
          laundry_id: string
          machine_number?: number | null
          machine_serial: string
          mercadopago_terminal_id?: string | null
          mqtt_broker?: string | null
          mqtt_password?: string | null
          mqtt_username?: string | null
          price: number
          status?: string | null
          stone_code?: string | null
          stone_terminal_id?: string | null
          store_id: string
          time_minutes: number
          type: string
          updated_at?: string
          wifi_password?: string | null
          wifi_ssid?: string | null
        }
        Update: {
          created_at?: string
          current_payment_id?: string | null
          current_session_start?: string | null
          elgin_terminal_id?: string | null
          esp32_id?: string | null
          esp32_password?: string | null
          expected_end_time?: string | null
          id?: string
          laundry_id?: string
          machine_number?: number | null
          machine_serial?: string
          mercadopago_terminal_id?: string | null
          mqtt_broker?: string | null
          mqtt_password?: string | null
          mqtt_username?: string | null
          price?: number
          status?: string | null
          stone_code?: string | null
          stone_terminal_id?: string | null
          store_id?: string
          time_minutes?: number
          type?: string
          updated_at?: string
          wifi_password?: string | null
          wifi_ssid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machines_current_payment_id_fkey"
            columns: ["current_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machines_laundry_id_fkey"
            columns: ["laundry_id"]
            isOneToOne: false
            referencedRelation: "laundries"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_receipts: {
        Row: {
          created_at: string
          customer_receipt: string | null
          id: string
          machine_id: string | null
          merchant_receipt: string | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_receipt?: string | null
          id?: string
          machine_id?: string | null
          merchant_receipt?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_receipt?: string | null
          id?: string
          machine_id?: string | null
          merchant_receipt?: string | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          access_token: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string
          id: string
          integration_id: string | null
          laundry_id: string
          merchant_name: string | null
          paygo_client_id: string | null
          paygo_client_secret: string | null
          paygo_merchant_id: string | null
          paygo_terminal_id: string | null
          provider: string
          public_key: string | null
          sandbox_mode: boolean
          stone_code: string | null
          terminal_model: string | null
          terminal_serial: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          id?: string
          integration_id?: string | null
          laundry_id: string
          merchant_name?: string | null
          paygo_client_id?: string | null
          paygo_client_secret?: string | null
          paygo_merchant_id?: string | null
          paygo_terminal_id?: string | null
          provider?: string
          public_key?: string | null
          sandbox_mode?: boolean
          stone_code?: string | null
          terminal_model?: string | null
          terminal_serial?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          id?: string
          integration_id?: string | null
          laundry_id?: string
          merchant_name?: string | null
          paygo_client_id?: string | null
          paygo_client_secret?: string | null
          paygo_merchant_id?: string | null
          paygo_terminal_id?: string | null
          provider?: string
          public_key?: string | null
          sandbox_mode?: boolean
          stone_code?: string | null
          terminal_model?: string | null
          terminal_serial?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_settings_laundry_id_fkey"
            columns: ["laundry_id"]
            isOneToOne: false
            referencedRelation: "laundries"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          machine_id: string | null
          method: string
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          machine_id?: string | null
          method: string
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          machine_id?: string | null
          method?: string
          status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_day: number
          created_at: string
          id: string
          laundry_id: string
          next_billing_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          billing_day: number
          created_at?: string
          id?: string
          laundry_id: string
          next_billing_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_day?: number
          created_at?: string
          id?: string
          laundry_id?: string
          next_billing_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_laundry_id_fkey"
            columns: ["laundry_id"]
            isOneToOne: false
            referencedRelation: "laundries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_role_by_id: {
        Args: { user_id: string }
        Returns: string
      }
      get_role_directly: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_safely: {
        Args: { user_id: string }
        Returns: string
      }
      has_laundry_access: {
        Args: { laundry_id: string; user_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_user_admin_safely: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "business" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "business", "user"],
    },
  },
} as const
