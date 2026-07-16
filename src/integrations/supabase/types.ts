export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_version: {
        Row: {
          active: boolean
          created_at: string
          id: number
          release_date: string
          version: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: never
          release_date: string
          version: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: never
          release_date?: string
          version?: string
        }
        Relationships: []
      }
      cashier_sessions: {
        Row: {
          closed_at: string | null
          closing_balance: number | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          opened_at: string
          opening_balance: number
          status: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          status?: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          opened_at?: string
          opening_balance?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashier_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order?: number | null
        }
        Relationships: []
      }
      category_complement_groups: {
        Row: {
          category_id: string
          created_at: string
          group_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          group_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_complement_groups_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_complement_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "complement_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      category_printer_mappings: {
        Row: {
          category_id: string
          id: string
          sector_id: string | null
        }
        Insert: {
          category_id: string
          id?: string
          sector_id?: string | null
        }
        Update: {
          category_id?: string
          id?: string
          sector_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_printer_mappings_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "printer_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          id: string
          level: number | null
          name: string
          parent_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          id?: string
          level?: number | null
          name: string
          parent_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          id?: string
          level?: number | null
          name?: string
          parent_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      complement_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          max_choices: number | null
          min_choices: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          max_choices?: number | null
          min_choices?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          max_choices?: number | null
          min_choices?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      complements: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          size_prices: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          size_prices?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          size_prices?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "complement_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_ledgers: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          order_id: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_ledgers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_ledgers_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          address_complement: string | null
          address_number: string | null
          allow_fiado: boolean | null
          auth_user_id: string | null
          city: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          credit_limit: number | null
          current_balance: number | null
          email: string | null
          id: string
          name: string
          neighborhood: string | null
          password: string | null
          person_type: Database["public"]["Enums"]["person_type"] | null
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          allow_fiado?: boolean | null
          auth_user_id?: string | null
          city?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          email?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          password?: string | null
          person_type?: Database["public"]["Enums"]["person_type"] | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          address_number?: string | null
          allow_fiado?: boolean | null
          auth_user_id?: string | null
          city?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          email?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          password?: string | null
          person_type?: Database["public"]["Enums"]["person_type"] | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      delivery_areas: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          created_at: string
          fee: number
          id: string
          is_active: boolean | null
          name: string
          polygon_coords: Json | null
          radius_km: number
          updated_at: string
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string
          fee?: number
          id?: string
          is_active?: boolean | null
          name: string
          polygon_coords?: Json | null
          radius_km?: number
          updated_at?: string
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string
          fee?: number
          id?: string
          is_active?: boolean | null
          name?: string
          polygon_coords?: Json | null
          radius_km?: number
          updated_at?: string
        }
        Relationships: []
      }
      delivery_order_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string
          priority: number | null
          product_id: string | null
          product_name: string
          production_status: string | null
          quantity: number
          selected_complements: Json | null
          total_price: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          priority?: number | null
          product_id?: string | null
          product_name: string
          production_status?: string | null
          quantity?: number
          selected_complements?: Json | null
          total_price: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          priority?: number | null
          product_id?: string | null
          product_name?: string
          production_status?: string | null
          quantity?: number
          selected_complements?: Json | null
          total_price?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_orders: {
        Row: {
          cashier_session_id: string | null
          created_at: string
          customer_address: string | null
          customer_cep: string | null
          customer_city: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_state: string | null
          delivery_fee: number | null
          driver_id: string | null
          driver_location: Json | null
          estimated_delivery_time: string | null
          estimated_time: number | null
          frete: number
          id: string
          is_on_account: boolean | null
          motoqueiro_lat: number | null
          motoqueiro_lng: number | null
          neighborhood: string | null
          notes: string | null
          observation: string | null
          order_type: string
          payment_method: string | null
          payment_split_details: Json | null
          reconciled_at: string | null
          status: string
          tipo_venda: string | null
          total_amount: number
          tracking_status: string | null
          updated_at: string
        }
        Insert: {
          cashier_session_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_cep?: string | null
          customer_city?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_state?: string | null
          delivery_fee?: number | null
          driver_id?: string | null
          driver_location?: Json | null
          estimated_delivery_time?: string | null
          estimated_time?: number | null
          frete?: number
          id?: string
          is_on_account?: boolean | null
          motoqueiro_lat?: number | null
          motoqueiro_lng?: number | null
          neighborhood?: string | null
          notes?: string | null
          observation?: string | null
          order_type?: string
          payment_method?: string | null
          payment_split_details?: Json | null
          reconciled_at?: string | null
          status?: string
          tipo_venda?: string | null
          total_amount?: number
          tracking_status?: string | null
          updated_at?: string
        }
        Update: {
          cashier_session_id?: string | null
          created_at?: string
          customer_address?: string | null
          customer_cep?: string | null
          customer_city?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_state?: string | null
          delivery_fee?: number | null
          driver_id?: string | null
          driver_location?: Json | null
          estimated_delivery_time?: string | null
          estimated_time?: number | null
          frete?: number
          id?: string
          is_on_account?: boolean | null
          motoqueiro_lat?: number | null
          motoqueiro_lng?: number | null
          neighborhood?: string | null
          notes?: string | null
          observation?: string | null
          order_type?: string
          payment_method?: string | null
          payment_split_details?: Json | null
          reconciled_at?: string | null
          status?: string
          tipo_venda?: string | null
          total_amount?: number
          tracking_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_cashier_session_id_fkey"
            columns: ["cashier_session_id"]
            isOneToOne: false
            referencedRelation: "cashier_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_trips: {
        Row: {
          cashier_session_id: string | null
          created_at: string
          driver_id: string
          fee_per_trip: number
          id: string
          notes: string | null
          total_fee: number
          trip_count: number
        }
        Insert: {
          cashier_session_id?: string | null
          created_at?: string
          driver_id: string
          fee_per_trip?: number
          id?: string
          notes?: string | null
          total_fee?: number
          trip_count?: number
        }
        Update: {
          cashier_session_id?: string | null
          created_at?: string
          driver_id?: string
          fee_per_trip?: number
          id?: string
          notes?: string | null
          total_fee?: number
          trip_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "driver_trips_cashier_session_id_fkey"
            columns: ["cashier_session_id"]
            isOneToOne: false
            referencedRelation: "cashier_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          active: boolean | null
          auth_user_id: string | null
          created_at: string | null
          daily_rate: number
          fixed_fee: number | null
          has_fixed_fee: boolean | null
          id: string
          is_active: boolean | null
          login: string | null
          name: string
          password: string | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          auth_user_id?: string | null
          created_at?: string | null
          daily_rate?: number
          fixed_fee?: number | null
          has_fixed_fee?: boolean | null
          id?: string
          is_active?: boolean | null
          login?: string | null
          name: string
          password?: string | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          auth_user_id?: string | null
          created_at?: string | null
          daily_rate?: number
          fixed_fee?: number | null
          has_fixed_fee?: boolean | null
          id?: string
          is_active?: boolean | null
          login?: string | null
          name?: string
          password?: string | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          chart_account_id: string | null
          created_at: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          chart_account_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          chart_account_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          cashier_session_id: string | null
          category_id: string | null
          chart_account_id: string | null
          created_at: string | null
          customer_id: string | null
          date: string
          description: string
          due_date: string | null
          id: string
          payment_date: string | null
          status: string | null
          supplier_id: string | null
          type: string
        }
        Insert: {
          amount: number
          cashier_session_id?: string | null
          category_id?: string | null
          chart_account_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          date?: string
          description: string
          due_date?: string | null
          id?: string
          payment_date?: string | null
          status?: string | null
          supplier_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          cashier_session_id?: string | null
          category_id?: string | null
          chart_account_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          date?: string
          description?: string
          due_date?: string | null
          id?: string
          payment_date?: string | null
          status?: string | null
          supplier_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_cashier_session_id_fkey"
            columns: ["cashier_session_id"]
            isOneToOne: false
            referencedRelation: "cashier_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_api_endpoints: {
        Row: {
          active: boolean | null
          chave: string
          created_at: string | null
          id: string
          label: string
          method: string
          url: string
        }
        Insert: {
          active?: boolean | null
          chave: string
          created_at?: string | null
          id?: string
          label: string
          method: string
          url: string
        }
        Update: {
          active?: boolean | null
          chave?: string
          created_at?: string | null
          id?: string
          label?: string
          method?: string
          url?: string
        }
        Relationships: []
      }
      fiscal_cclass_trib: {
        Row: {
          aliquota_cbs: number | null
          cclass_trib: string | null
          created_at: string
          cst: string | null
          cst_ibs_cbs: string | null
          descr_cclass_trib: string | null
          id: string
          ind_g_trib_regular: boolean | null
          ind_nfce: boolean | null
          ind_nfe: boolean | null
          nome_cclass_trib: string | null
          pred_cbs: number | null
          pred_ibs: number | null
          updated_at: string
        }
        Insert: {
          aliquota_cbs?: number | null
          cclass_trib?: string | null
          created_at?: string
          cst?: string | null
          cst_ibs_cbs?: string | null
          descr_cclass_trib?: string | null
          id?: string
          ind_g_trib_regular?: boolean | null
          ind_nfce?: boolean | null
          ind_nfe?: boolean | null
          nome_cclass_trib?: string | null
          pred_cbs?: number | null
          pred_ibs?: number | null
          updated_at?: string
        }
        Update: {
          aliquota_cbs?: number | null
          cclass_trib?: string | null
          created_at?: string
          cst?: string | null
          cst_ibs_cbs?: string | null
          descr_cclass_trib?: string | null
          id?: string
          ind_g_trib_regular?: boolean | null
          ind_nfce?: boolean | null
          ind_nfe?: boolean | null
          nome_cclass_trib?: string | null
          pred_cbs?: number | null
          pred_ibs?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      fiscal_documents: {
        Row: {
          ambiente: number | null
          cancelado_em: string | null
          chave_acesso: string | null
          cliente_nome: string | null
          codigo_status: string | null
          created_at: string | null
          danfe_url: string | null
          emitido_em: string | null
          id: string
          id_nuvemfiscal: string | null
          modelo: number
          motivo_status: string | null
          numero: number
          pedido_id: string
          protocolo: string | null
          request_json: Json | null
          response_json: Json | null
          serie: number
          status: string
          tipo: string
          updated_at: string | null
          valor_cbs: number | null
          valor_cofins: number | null
          valor_ibs: number | null
          valor_icms: number | null
          valor_pis: number | null
          valor_produtos: number | null
          valor_total: number | null
          xml_url: string | null
        }
        Insert: {
          ambiente?: number | null
          cancelado_em?: string | null
          chave_acesso?: string | null
          cliente_nome?: string | null
          codigo_status?: string | null
          created_at?: string | null
          danfe_url?: string | null
          emitido_em?: string | null
          id?: string
          id_nuvemfiscal?: string | null
          modelo: number
          motivo_status?: string | null
          numero: number
          pedido_id: string
          protocolo?: string | null
          request_json?: Json | null
          response_json?: Json | null
          serie: number
          status?: string
          tipo: string
          updated_at?: string | null
          valor_cbs?: number | null
          valor_cofins?: number | null
          valor_ibs?: number | null
          valor_icms?: number | null
          valor_pis?: number | null
          valor_produtos?: number | null
          valor_total?: number | null
          xml_url?: string | null
        }
        Update: {
          ambiente?: number | null
          cancelado_em?: string | null
          chave_acesso?: string | null
          cliente_nome?: string | null
          codigo_status?: string | null
          created_at?: string | null
          danfe_url?: string | null
          emitido_em?: string | null
          id?: string
          id_nuvemfiscal?: string | null
          modelo?: number
          motivo_status?: string | null
          numero?: number
          pedido_id?: string
          protocolo?: string | null
          request_json?: Json | null
          response_json?: Json | null
          serie?: number
          status?: string
          tipo?: string
          updated_at?: string | null
          valor_cbs?: number | null
          valor_cofins?: number | null
          valor_ibs?: number | null
          valor_icms?: number | null
          valor_pis?: number | null
          valor_produtos?: number | null
          valor_total?: number | null
          xml_url?: string | null
        }
        Relationships: []
      }
      fiscal_endpoints: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          method: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          method?: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          method?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      fiscal_error_logs: {
        Row: {
          created_at: string
          diagnostics: Json | null
          id: string
          mensagem: string | null
          pedido_id: string | null
          raw: string | null
          tipo: string | null
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          diagnostics?: Json | null
          id?: string
          mensagem?: string | null
          pedido_id?: string | null
          raw?: string | null
          tipo?: string | null
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          diagnostics?: Json | null
          id?: string
          mensagem?: string | null
          pedido_id?: string | null
          raw?: string | null
          tipo?: string | null
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      fiscal_logs: {
        Row: {
          created_at: string | null
          detalhes: Json | null
          evento: string
          fiscal_document_id: string | null
          id: string
          ip: string | null
          mensagem: string | null
          pedido_id: string | null
          status: string | null
          tipo: string
          usuario_id: string | null
          usuario_nome: string | null
        }
        Insert: {
          created_at?: string | null
          detalhes?: Json | null
          evento: string
          fiscal_document_id?: string | null
          id?: string
          ip?: string | null
          mensagem?: string | null
          pedido_id?: string | null
          status?: string | null
          tipo: string
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Update: {
          created_at?: string | null
          detalhes?: Json | null
          evento?: string
          fiscal_document_id?: string | null
          id?: string
          ip?: string | null
          mensagem?: string | null
          pedido_id?: string | null
          status?: string | null
          tipo?: string
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Relationships: []
      }
      fiscal_note_config: {
        Row: {
          active: boolean | null
          created_at: string | null
          fin_nfe: number
          id: string
          id_dest: number
          ind_final: number
          ind_intermed: number
          ind_pres: number
          mod_nfce: number
          mod_nfe: number
          proc_emi: number
          resp_tec_cnpj: string | null
          resp_tec_contato: string | null
          resp_tec_email: string | null
          resp_tec_fone: string | null
          scope_nfce: string
          scope_nfe: string
          tp_emis: number
          tp_imp: number
          tp_nf: number
          ver_proc: string
          versao: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          fin_nfe: number
          id?: string
          id_dest: number
          ind_final: number
          ind_intermed: number
          ind_pres: number
          mod_nfce: number
          mod_nfe: number
          proc_emi: number
          resp_tec_cnpj?: string | null
          resp_tec_contato?: string | null
          resp_tec_email?: string | null
          resp_tec_fone?: string | null
          scope_nfce: string
          scope_nfe: string
          tp_emis: number
          tp_imp: number
          tp_nf: number
          ver_proc: string
          versao: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          fin_nfe?: number
          id?: string
          id_dest?: number
          ind_final?: number
          ind_intermed?: number
          ind_pres?: number
          mod_nfce?: number
          mod_nfe?: number
          proc_emi?: number
          resp_tec_cnpj?: string | null
          resp_tec_contato?: string | null
          resp_tec_email?: string | null
          resp_tec_fone?: string | null
          scope_nfce?: string
          scope_nfe?: string
          tp_emis?: number
          tp_imp?: number
          tp_nf?: number
          ver_proc?: string
          versao?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          chart_account_id: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          chart_account_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          chart_account_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_chart_account_id_fkey"
            columns: ["chart_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      print_jobs: {
        Row: {
          content: string
          created_at: string | null
          error_message: string | null
          id: string
          printer_id: string | null
          retry_count: number | null
          sector_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          printer_id?: string | null
          retry_count?: number | null
          sector_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          printer_id?: string | null
          retry_count?: number | null
          sector_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "print_jobs_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "printer_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      printer_sectors: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      printers: {
        Row: {
          auto_browser_print: boolean | null
          auto_print: boolean | null
          connection_type: string | null
          copies: number | null
          created_at: string | null
          description: string | null
          esc_pos_compatible: boolean | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          model: string | null
          name: string
          port: number | null
          priority: number | null
          sector_id: string | null
          show_preview: boolean | null
          updated_at: string | null
        }
        Insert: {
          auto_browser_print?: boolean | null
          auto_print?: boolean | null
          connection_type?: string | null
          copies?: number | null
          created_at?: string | null
          description?: string | null
          esc_pos_compatible?: boolean | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          model?: string | null
          name: string
          port?: number | null
          priority?: number | null
          sector_id?: string | null
          show_preview?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auto_browser_print?: boolean | null
          auto_print?: boolean | null
          connection_type?: string | null
          copies?: number | null
          created_at?: string | null
          description?: string | null
          esc_pos_compatible?: boolean | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          model?: string | null
          name?: string
          port?: number | null
          priority?: number | null
          sector_id?: string | null
          show_preview?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "printers_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "printer_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      printing_jobs: {
        Row: {
          content: string
          created_at: string | null
          error_message: string | null
          id: string
          printer_id: string | null
          retry_count: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          printer_id?: string | null
          retry_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          printer_id?: string | null
          retry_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "printing_jobs_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_complement_groups: {
        Row: {
          created_at: string
          group_id: string
          id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_complement_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "complement_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_complement_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recipe: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          notes: string | null
          product_id: string
          quantity: number
          unit: string | null
          updated_at: string
          variant_label: string | null
          waste_percentage: number
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          notes?: string | null
          product_id: string
          quantity?: number
          unit?: string | null
          updated_at?: string
          variant_label?: string | null
          waste_percentage?: number
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          unit?: string | null
          updated_at?: string
          variant_label?: string | null
          waste_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_recipe_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recipe_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tax_rules: {
        Row: {
          active: boolean
          aliq_cbs: number
          aliq_cofins: number
          aliq_ibsmun: number
          aliq_ibsuf: number
          aliq_icms: number
          aliq_pis: number
          aliquota_cbs: number | null
          aliquota_ibs: number | null
          cclass_trib: string | null
          cfop: string | null
          cfop_estadual: string | null
          cfop_interestadual: string | null
          created_at: string
          cst: string | null
          cst_cofins: string
          cst_ibscbs: string | null
          cst_icms_estadual: string | null
          cst_icms_interestadual: string | null
          cst_pis: string
          descricao: string | null
          id: string
          nome: string
          orig_icms: number
          red_bc: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          aliq_cbs?: number
          aliq_cofins?: number
          aliq_ibsmun?: number
          aliq_ibsuf?: number
          aliq_icms?: number
          aliq_pis?: number
          aliquota_cbs?: number | null
          aliquota_ibs?: number | null
          cclass_trib?: string | null
          cfop?: string | null
          cfop_estadual?: string | null
          cfop_interestadual?: string | null
          created_at?: string
          cst?: string | null
          cst_cofins?: string
          cst_ibscbs?: string | null
          cst_icms_estadual?: string | null
          cst_icms_interestadual?: string | null
          cst_pis?: string
          descricao?: string | null
          id?: string
          nome: string
          orig_icms?: number
          red_bc?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          aliq_cbs?: number
          aliq_cofins?: number
          aliq_ibsmun?: number
          aliq_ibsuf?: number
          aliq_icms?: number
          aliq_pis?: number
          aliquota_cbs?: number | null
          aliquota_ibs?: number | null
          cclass_trib?: string | null
          cfop?: string | null
          cfop_estadual?: string | null
          cfop_interestadual?: string | null
          created_at?: string
          cst?: string | null
          cst_cofins?: string
          cst_ibscbs?: string | null
          cst_icms_estadual?: string | null
          cst_icms_interestadual?: string | null
          cst_pis?: string
          descricao?: string | null
          id?: string
          nome?: string
          orig_icms?: number
          red_bc?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          allow_crust: boolean | null
          allow_half_half: boolean | null
          allow_sell_without_stock: boolean
          category_id: string | null
          cest: string | null
          control_inventory: boolean
          cost_per_unit: number | null
          created_at: string | null
          cst: string | null
          current_stock: number
          description: string | null
          desired_margin_percentage: number | null
          discount_percent: number | null
          discount_price: number | null
          ean_code: string | null
          energy_cost: number
          id: string
          image_url: string | null
          is_available: boolean | null
          is_pizza_flavor: boolean | null
          is_promotional: boolean | null
          labor_cost: number
          loss_percentage: number
          minimum_stock: number
          name: string
          ncm: string | null
          packaging_cost: number
          price: number
          price_2: number | null
          product_type: string
          purchase_price: number | null
          sell_delivery: boolean | null
          sell_digital_menu: boolean | null
          sell_dine_in: boolean | null
          send_to_kds: boolean | null
          send_to_production: boolean | null
          size_prices: Json | null
          suggested_products: string[] | null
          supplier_code: string | null
          supplier_name: string | null
          tax_rule_id: string | null
          tipo_produto: string
          unidade: string
          unit: string | null
          yield_quantity: number | null
        }
        Insert: {
          active?: boolean | null
          allow_crust?: boolean | null
          allow_half_half?: boolean | null
          allow_sell_without_stock?: boolean
          category_id?: string | null
          cest?: string | null
          control_inventory?: boolean
          cost_per_unit?: number | null
          created_at?: string | null
          cst?: string | null
          current_stock?: number
          description?: string | null
          desired_margin_percentage?: number | null
          discount_percent?: number | null
          discount_price?: number | null
          ean_code?: string | null
          energy_cost?: number
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_pizza_flavor?: boolean | null
          is_promotional?: boolean | null
          labor_cost?: number
          loss_percentage?: number
          minimum_stock?: number
          name: string
          ncm?: string | null
          packaging_cost?: number
          price: number
          price_2?: number | null
          product_type?: string
          purchase_price?: number | null
          sell_delivery?: boolean | null
          sell_digital_menu?: boolean | null
          sell_dine_in?: boolean | null
          send_to_kds?: boolean | null
          send_to_production?: boolean | null
          size_prices?: Json | null
          suggested_products?: string[] | null
          supplier_code?: string | null
          supplier_name?: string | null
          tax_rule_id?: string | null
          tipo_produto?: string
          unidade?: string
          unit?: string | null
          yield_quantity?: number | null
        }
        Update: {
          active?: boolean | null
          allow_crust?: boolean | null
          allow_half_half?: boolean | null
          allow_sell_without_stock?: boolean
          category_id?: string | null
          cest?: string | null
          control_inventory?: boolean
          cost_per_unit?: number | null
          created_at?: string | null
          cst?: string | null
          current_stock?: number
          description?: string | null
          desired_margin_percentage?: number | null
          discount_percent?: number | null
          discount_price?: number | null
          ean_code?: string | null
          energy_cost?: number
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_pizza_flavor?: boolean | null
          is_promotional?: boolean | null
          labor_cost?: number
          loss_percentage?: number
          minimum_stock?: number
          name?: string
          ncm?: string | null
          packaging_cost?: number
          price?: number
          price_2?: number | null
          product_type?: string
          purchase_price?: number | null
          sell_delivery?: boolean | null
          sell_digital_menu?: boolean | null
          sell_dine_in?: boolean | null
          send_to_kds?: boolean | null
          send_to_production?: boolean | null
          size_prices?: Json | null
          suggested_products?: string[] | null
          supplier_code?: string | null
          supplier_name?: string | null
          tax_rule_id?: string | null
          tipo_produto?: string
          unidade?: string
          unit?: string | null
          yield_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tax_rule_id_fkey"
            columns: ["tax_rule_id"]
            isOneToOne: false
            referencedRelation: "product_tax_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean | null
          allowed_modules: Json
          can_cancel: boolean | null
          can_delete: boolean | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_kds_only: boolean | null
          password: string | null
          role: string | null
          username: string | null
          visible_fields: Json
        }
        Insert: {
          active?: boolean | null
          allowed_modules?: Json
          can_cancel?: boolean | null
          can_delete?: boolean | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_kds_only?: boolean | null
          password?: string | null
          role?: string | null
          username?: string | null
          visible_fields?: Json
        }
        Update: {
          active?: boolean | null
          allowed_modules?: Json
          can_cancel?: boolean | null
          can_delete?: boolean | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_kds_only?: boolean | null
          password?: string | null
          role?: string | null
          username?: string | null
          visible_fields?: Json
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          created_at: string
          id: string
          number: string
          prefix: string | null
          qr_code_url: string | null
          sector: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          number: string
          prefix?: string | null
          qr_code_url?: string | null
          sector?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          number?: string
          prefix?: string | null
          qr_code_url?: string | null
          sector?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          access_token_nfce: string | null
          access_token_nfe: string | null
          access_token_nuvemf_cep: string | null
          access_token_nuvemf_nfce: string | null
          access_token_nuvemf_nfe: string | null
          address: string | null
          address_number: string | null
          aliq_cbs: number
          aliq_ibsmun: number
          aliq_ibsuf: number
          auto_manage_menu: boolean | null
          centralized_printing: boolean | null
          city: string | null
          client_id: string | null
          client_secret: string | null
          cnpj: string | null
          complement: string | null
          couvert_artistico_enabled: boolean | null
          couvert_artistico_value: number | null
          cpf: string | null
          created_at: string | null
          default_driver_fee: number | null
          delivery_enabled: boolean | null
          digital_menu_url: string | null
          email: string | null
          envia_ibscbs: boolean
          expire_token_nuvemf_cep: string | null
          expire_token_nuvemf_nfce: string | null
          expire_token_nuvemf_nfe: string | null
          fiscal_nfce_enabled: boolean
          fiscal_nfe_enabled: boolean
          fixed_delivery_fee: number | null
          google_maps_api_key: string | null
          id: string
          idle_table_time_minutes: number | null
          is_menu_active: boolean | null
          kds_enabled: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string | null
          neighborhood: string | null
          opening_hours: Json | null
          pickup_enabled: boolean | null
          print_item_separately: boolean | null
          print_paper_format: string | null
          scope_nuvemf_cep: string | null
          scope_nuvemf_nfce: string | null
          scope_nuvemf_nfe: string | null
          service_tax_enabled: boolean | null
          service_tax_percent: number | null
          sidebar_logo_url: string | null
          state: string | null
          table_print_mode: string | null
          thermal_printer_model: string | null
          updated_at: string | null
          whatsapp_api_key: string | null
          whatsapp_api_url: string | null
          whatsapp_bot_enabled: boolean
          whatsapp_instance_name: string | null
          whatsapp_number: string | null
          zip_code: string | null
        }
        Insert: {
          access_token_nfce?: string | null
          access_token_nfe?: string | null
          access_token_nuvemf_cep?: string | null
          access_token_nuvemf_nfce?: string | null
          access_token_nuvemf_nfe?: string | null
          address?: string | null
          address_number?: string | null
          aliq_cbs?: number
          aliq_ibsmun?: number
          aliq_ibsuf?: number
          auto_manage_menu?: boolean | null
          centralized_printing?: boolean | null
          city?: string | null
          client_id?: string | null
          client_secret?: string | null
          cnpj?: string | null
          complement?: string | null
          couvert_artistico_enabled?: boolean | null
          couvert_artistico_value?: number | null
          cpf?: string | null
          created_at?: string | null
          default_driver_fee?: number | null
          delivery_enabled?: boolean | null
          digital_menu_url?: string | null
          email?: string | null
          envia_ibscbs?: boolean
          expire_token_nuvemf_cep?: string | null
          expire_token_nuvemf_nfce?: string | null
          expire_token_nuvemf_nfe?: string | null
          fiscal_nfce_enabled?: boolean
          fiscal_nfe_enabled?: boolean
          fixed_delivery_fee?: number | null
          google_maps_api_key?: string | null
          id?: string
          idle_table_time_minutes?: number | null
          is_menu_active?: boolean | null
          kds_enabled?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string | null
          neighborhood?: string | null
          opening_hours?: Json | null
          pickup_enabled?: boolean | null
          print_item_separately?: boolean | null
          print_paper_format?: string | null
          scope_nuvemf_cep?: string | null
          scope_nuvemf_nfce?: string | null
          scope_nuvemf_nfe?: string | null
          service_tax_enabled?: boolean | null
          service_tax_percent?: number | null
          sidebar_logo_url?: string | null
          state?: string | null
          table_print_mode?: string | null
          thermal_printer_model?: string | null
          updated_at?: string | null
          whatsapp_api_key?: string | null
          whatsapp_api_url?: string | null
          whatsapp_bot_enabled?: boolean
          whatsapp_instance_name?: string | null
          whatsapp_number?: string | null
          zip_code?: string | null
        }
        Update: {
          access_token_nfce?: string | null
          access_token_nfe?: string | null
          access_token_nuvemf_cep?: string | null
          access_token_nuvemf_nfce?: string | null
          access_token_nuvemf_nfe?: string | null
          address?: string | null
          address_number?: string | null
          aliq_cbs?: number
          aliq_ibsmun?: number
          aliq_ibsuf?: number
          auto_manage_menu?: boolean | null
          centralized_printing?: boolean | null
          city?: string | null
          client_id?: string | null
          client_secret?: string | null
          cnpj?: string | null
          complement?: string | null
          couvert_artistico_enabled?: boolean | null
          couvert_artistico_value?: number | null
          cpf?: string | null
          created_at?: string | null
          default_driver_fee?: number | null
          delivery_enabled?: boolean | null
          digital_menu_url?: string | null
          email?: string | null
          envia_ibscbs?: boolean
          expire_token_nuvemf_cep?: string | null
          expire_token_nuvemf_nfce?: string | null
          expire_token_nuvemf_nfe?: string | null
          fiscal_nfce_enabled?: boolean
          fiscal_nfe_enabled?: boolean
          fixed_delivery_fee?: number | null
          google_maps_api_key?: string | null
          id?: string
          idle_table_time_minutes?: number | null
          is_menu_active?: boolean | null
          kds_enabled?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string | null
          neighborhood?: string | null
          opening_hours?: Json | null
          pickup_enabled?: boolean | null
          print_item_separately?: boolean | null
          print_paper_format?: string | null
          scope_nuvemf_cep?: string | null
          scope_nuvemf_nfce?: string | null
          scope_nuvemf_nfe?: string | null
          service_tax_enabled?: boolean | null
          service_tax_percent?: number | null
          sidebar_logo_url?: string | null
          state?: string | null
          table_print_mode?: string | null
          thermal_printer_model?: string | null
          updated_at?: string | null
          whatsapp_api_key?: string | null
          whatsapp_api_url?: string | null
          whatsapp_bot_enabled?: boolean
          whatsapp_instance_name?: string | null
          whatsapp_number?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          address_number: string | null
          city: string | null
          cnpj: string | null
          contact_name: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          address_number?: string | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          address_number?: string | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      table_order_items: {
        Row: {
          batch_id: string | null
          created_at: string
          id: string
          observations: string | null
          printed: boolean | null
          priority: number | null
          product_id: string | null
          product_name: string | null
          production_status: string | null
          quantity: number
          selected_complements: Json | null
          sent_at: string | null
          session_id: string | null
          status: string | null
          total_price: number
          unit_price: number
          updated_at: string | null
          waiter_id: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          id?: string
          observations?: string | null
          printed?: boolean | null
          priority?: number | null
          product_id?: string | null
          product_name?: string | null
          production_status?: string | null
          quantity?: number
          selected_complements?: Json | null
          sent_at?: string | null
          session_id?: string | null
          status?: string | null
          total_price: number
          unit_price: number
          updated_at?: string | null
          waiter_id?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          id?: string
          observations?: string | null
          printed?: boolean | null
          priority?: number | null
          product_id?: string | null
          product_name?: string | null
          production_status?: string | null
          quantity?: number
          selected_complements?: Json | null
          sent_at?: string | null
          session_id?: string | null
          status?: string | null
          total_price?: number
          unit_price?: number
          updated_at?: string | null
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_order_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "table_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_order_items_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "waiters"
            referencedColumns: ["id"]
          },
        ]
      }
      table_sessions: {
        Row: {
          cashier_session_id: string | null
          client_name: string | null
          closed_at: string | null
          command_number: string | null
          couvert_value: number | null
          created_at: string
          customer_id: string | null
          id: string
          observations: string | null
          opened_at: string
          payment_method: string | null
          people_count: number | null
          service_tax_value: number | null
          status: string
          table_id: string | null
          total_amount: number | null
          updated_at: string
          waiter_id: string | null
        }
        Insert: {
          cashier_session_id?: string | null
          client_name?: string | null
          closed_at?: string | null
          command_number?: string | null
          couvert_value?: number | null
          created_at?: string
          customer_id?: string | null
          id?: string
          observations?: string | null
          opened_at?: string
          payment_method?: string | null
          people_count?: number | null
          service_tax_value?: number | null
          status?: string
          table_id?: string | null
          total_amount?: number | null
          updated_at?: string
          waiter_id?: string | null
        }
        Update: {
          cashier_session_id?: string | null
          client_name?: string | null
          closed_at?: string | null
          command_number?: string | null
          couvert_value?: number | null
          created_at?: string
          customer_id?: string | null
          id?: string
          observations?: string | null
          opened_at?: string
          payment_method?: string | null
          people_count?: number | null
          service_tax_value?: number | null
          status?: string
          table_id?: string | null
          total_amount?: number | null
          updated_at?: string
          waiter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_sessions_cashier_session_id_fkey"
            columns: ["cashier_session_id"]
            isOneToOne: false
            referencedRelation: "cashier_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_waiter_id_fkey"
            columns: ["waiter_id"]
            isOneToOne: false
            referencedRelation: "waiters"
            referencedColumns: ["id"]
          },
        ]
      }
      waiters: {
        Row: {
          active: boolean | null
          auth_user_id: string | null
          code: string | null
          commission_percent: number | null
          created_at: string
          has_commission: boolean | null
          id: string
          login: string
          name: string
          password: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          auth_user_id?: string | null
          code?: string | null
          commission_percent?: number | null
          created_at?: string
          has_commission?: boolean | null
          id?: string
          login: string
          name: string
          password: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          auth_user_id?: string | null
          code?: string | null
          commission_percent?: number | null
          created_at?: string
          has_commission?: boolean | null
          id?: string
          login?: string
          name?: string
          password?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      weekly_campaigns: {
        Row: {
          auto_close_seconds: number | null
          autoplay: boolean
          background_color: string | null
          button_link: string | null
          button_text: string | null
          clicks_count: number
          created_at: string
          day_of_week: number
          expires_at: string | null
          id: string
          is_active: boolean
          media_type: string
          media_url: string | null
          muted: boolean
          priority: number
          show_mode: string
          subtitle: string | null
          title: string | null
          updated_at: string
          views_count: number
        }
        Insert: {
          auto_close_seconds?: number | null
          autoplay?: boolean
          background_color?: string | null
          button_link?: string | null
          button_text?: string | null
          clicks_count?: number
          created_at?: string
          day_of_week: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          media_type?: string
          media_url?: string | null
          muted?: boolean
          priority?: number
          show_mode?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          views_count?: number
        }
        Update: {
          auto_close_seconds?: number | null
          autoplay?: boolean
          background_color?: string | null
          button_link?: string | null
          button_text?: string | null
          clicks_count?: number
          created_at?: string
          day_of_week?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          media_type?: string
          media_url?: string | null
          muted?: boolean
          priority?: number
          show_mode?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      whatsapp_bot_messages: {
        Row: {
          created_at: string
          id: string
          key: string
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          message?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string
          id: string
          last_message: string | null
          metadata: Json | null
          status: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone: string
          id?: string
          last_message?: string | null
          metadata?: Json | null
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string
          id?: string
          last_message?: string | null
          metadata?: Json | null
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          direction: string
          id: string
          metadata: Json | null
          sender: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          direction: string
          id?: string
          metadata?: Json | null
          sender?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          direction?: string
          id?: string
          metadata?: Json | null
          sender?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_stock_for_order: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      consume_stock_for_session: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      increment_campaign_click: {
        Args: { campaign_id: string }
        Returns: undefined
      }
      increment_campaign_view: {
        Args: { campaign_id: string }
        Returns: undefined
      }
      registrar_saida_estoque_pedido: {
        Args: { p_order_id: string; p_order_type: string }
        Returns: undefined
      }
    }
    Enums: {
      person_type: "fisica" | "juridica"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      person_type: ["fisica", "juridica"],
    },
  },
} as const
