<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold mb-8 text-purple-deep">
            <font-awesome-icon icon="fas fa-edit" class="mr-2 text-purple-light" />
            Editar Reserva #{{ idReserva || '...' }}
        </h1>

        <div v-if="loading" class="text-center p-10 bg-gray-50 rounded-lg">
            <font-awesome-icon icon="fas fa-spinner" spin class="text-4xl text-purple-deep" />
            <p class="mt-4 text-gray-600">Cargando detalles de la reserva...</p>
        </div>
        
        <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
            <p>Error: {{ error }}</p>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="bg-white p-8 rounded-xl shadow-2xl space-y-8">
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-4">
                <div class="p-3 bg-purple-100/30 rounded-lg col-span-2">
                    <p class="text-sm font-semibold text-gray-700 mb-2">Código de Trazabilidad:</p>
                    <p class="text-xl font-extrabold text-purple-dark">{{ reservaForm.cod_trazabilidad || 'N/A' }}</p>
                </div>
                <div class="p-3 bg-green-100/50 rounded-lg">
                    <label class="block text-sm font-medium text-purple-deep">Precio Total</label>
                    <p class="mt-1 text-xl font-extrabold text-green-700">${{ reservaForm.precio_total?.toLocaleString('es-CL') ?? '0' }}</p>
                </div>
            </div>

            <h2 class="text-xl font-semibold border-b pb-3 text-dark-primary-blue mt-4">Datos del Cliente</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="p-3 bg-gray-50 rounded-lg">
                    <label class="block text-sm font-medium text-purple-deep">Cliente</label>
                    <p class="mt-1 font-bold text-gray-800">{{ reservaForm.nombre_cliente || 'N/A' }}</p>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg">
                    <label class="block text-sm font-medium text-purple-deep">Correo</label>
                    <p class="mt-1 text-gray-800">{{ reservaForm.correo_cliente || 'N/A' }}</p>
                </div>
            </div>
            
            <div v-if="reservaForm.mascota_datos?.nombre && reservaForm.mascota_datos.nombre !== 'N/A'" class="mt-6">
                <h2 class="text-xl font-semibold border-b pb-3 text-dark-primary-blue">Datos de la Mascota</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <label class="block text-sm font-medium text-purple-deep">Nombre</label>
                        <p class="mt-1 font-bold text-gray-800">{{ reservaForm.mascota_datos.nombre }}</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <label class="block text-sm font-medium text-purple-deep">Peso (kg)</label>
                        <p class="mt-1 text-gray-800">{{ reservaForm.mascota_datos.peso ?? 'N/A' }}</p>
                    </div>
                    <div class="p-3 bg-gray-50 rounded-lg">
                        <label class="block text-sm font-medium text-purple-deep">Edad</label>
                        <p class="mt-1 text-gray-800">{{ reservaForm.mascota_datos.edad ?? 'N/A' }}</p>
                    </div>
                </div>
            </div>

            <div v-if="reservaForm.nombre_servicio && reservaForm.nombre_servicio !== 'N/A'" class="mt-6">
                <h2 class="text-xl font-semibold border-b pb-3 text-dark-primary-blue">Servicio Reservado</h2>
                <div class="p-3 bg-gray-50 rounded-lg pt-4">
                    <p class="text-base font-bold text-gray-800">{{ reservaForm.nombre_servicio }} ({{ reservaForm.tipo_servicio }})</p>
                </div>
            </div>

            <div v-if="reservaForm.productos_comprados && reservaForm.productos_comprados.length > 0" class="mt-6">
                <h2 class="text-xl font-semibold border-b pb-3 text-dark-primary-blue">Productos Adicionales Comprados</h2>
                <div class="space-y-3 pt-4 border-l border-gray-300 pl-4">
                    <div v-for="(producto, index) in reservaForm.productos_comprados" :key="index" class="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                        <span class="font-medium text-gray-800">{{ producto.nombre }}</span>
                        <span class="font-bold text-purple-dark">
                            ({{ producto.cantidad }} x ${{ producto.precio?.toLocaleString('es-CL') }})
                        </span>
                    </div>
                </div>
            </div>
            
            <h2 class="text-xl font-semibold border-b pb-3 pt-4 text-dark-primary-blue">Ajuste de Horario y Estado</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label for="estado" class="block text-sm font-medium text-gray-700">Estado de la Reserva</label>
                    <select id="estado" v-model="reservaForm.estado_reserva" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-purple-deep focus:border-purple-deep">
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmada">Confirmada</option>
                        <option value="En Proceso">En Proceso (Cremación)</option>
                        <option value="Finalizada">Finalizada (Lista para entrega)</option>
                        <option value="Cancelada">Cancelada</option>
                    </select>
                </div>
                <div>
                    <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha Reservada</label>
                    <input type="date" id="fecha" v-model="reservaForm.fecha_reservada" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-purple-deep focus:border-purple-deep" />
                </div>
                <div>
                    <label for="hora" class="block text-sm font-medium text-gray-700">Hora Reservada</label>
                    <input type="time" id="hora" v-model="reservaForm.hora_reservada" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-purple-deep focus:border-purple-deep" />
                </div>
            </div>

            <div class="flex justify-between items-center border-t pt-6 mt-8">
                
                <button type="button" 
                        @click="handleDelete" 
                        :disabled="saving"
                        class="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-150 disabled:opacity-50">
                    <font-awesome-icon icon="fas fa-trash" class="mr-2" />
                    Borrar Reserva
                </button>
                
                <div class="space-x-4">
                    <button type="button" @click="handleCancel" class="inline-flex justify-center py-3 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 transition duration-150">
                        Cancelar
                    </button>
                    <button type="submit" 
                            :disabled="saving"
                            class="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-deep hover:bg-purple-light transition duration-150 disabled:opacity-50">
                        <font-awesome-icon v-if="saving" icon="fas fa-spinner" spin class="mr-2" />
                        <font-awesome-icon v-else icon="fas fa-save" class="mr-2" />
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSave, faSpinner, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
library.add(faSave, faSpinner, faEdit, faTrash);

// ------------------------------------
// 🔥 CORRECCIÓN: DEFINICIÓN DE INTERFACES
// Esto soluciona el error 'Cannot find name 'ReservaDetalle''
// ------------------------------------
interface ProductoComprado {
    nombre: string;
    cantidad: number;
    precio: number; // Debe ser number para coincidir con la conversión del backend
}

interface MascotaDatos {
    nombre: string;
    peso: number | null;
    edad: number | null;
}

interface ReservaDetalle {
    id_reserva: number;
    cod_trazabilidad: string;
    estado_reserva: string;
    fecha_reservada: string;
    hora_reservada: string;
    precio_total: number;
    nombre_cliente: string;
    correo_cliente: string;
    nombre_servicio?: string;
    tipo_servicio?: string;
    region?: string | null;
    comuna?: string | null;
    direccion?: string | null;
    mascota_datos: MascotaDatos | null; // Acepta null si no hay datos
    productos_comprados: ProductoComprado[];
}

// ------------------------------------
// ESTADO REACTIVO
// ------------------------------------
const reservaForm = ref<Partial<ReservaDetalle>>({}); 
const idReserva = ref<number | null>(null);
const loading = ref(true);
const saving = ref(false); 
const error = ref<string | null>(null);
const route = useRoute();
const router = useRouter(); 

// ------------------------------------
// FUNCIONES DE CARGA DE DATOS
// ------------------------------------
const fetchReservaData = async (id: number) => {
    loading.value = true;
    error.value = null;
    try {
        const response = await $fetch(`/api/admin/reserva-detalle-editable`, {
            query: { id: id }, 
        }) as ReservaDetalle;

        // Inicializar datos para el formulario si son nulos (para evitar errores en el template)
        if (!response.mascota_datos) {
            response.mascota_datos = { nombre: 'N/A', peso: null, edad: null };
        }
        if (!response.productos_comprados) {
             response.productos_comprados = [];
        }

        reservaForm.value = response;

    } catch (e: any) {
        console.error("Error al cargar la reserva:", e);
        error.value = e.data?.statusMessage || "Error desconocido al cargar la información. Revise la consola del servidor.";
    } finally {
        loading.value = false;
    }
};

// ------------------------------------
// FUNCIONES DE ACCIÓN
// ------------------------------------

// 1. CANCELAR
const handleCancel = () => {
    router.push('/admin/dashboard'); 
};

// 2. GUARDAR (PUT)
const handleSubmit = async () => {
    saving.value = true;
    error.value = null;

    if (!idReserva.value) {
        error.value = "Error: ID de reserva no válido para guardar.";
        saving.value = false;
        return;
    }

    try {
        const payload = {
            id_reserva: idReserva.value,
            // Solo enviamos los campos editables
            estado_reserva: reservaForm.value.estado_reserva,
            fecha_reservada: reservaForm.value.fecha_reservada,
            hora_reservada: reservaForm.value.hora_reservada,
        };

        const response = await $fetch(`/api/admin/editar-reserva`, {
            method: 'PUT',
            body: payload,
        });

        alert((response as { message: string }).message);
        router.push('/admin/dashboard'); 
        
    } catch (e: any) {
        console.error('Error al guardar:', e);
        error.value = e.data?.statusMessage || 'Fallo al guardar. Revise la consola.';
    } finally {
        saving.value = false;
    }
};

// 3. ELIMINAR (DELETE)
const handleDelete = async () => {
    if (!idReserva.value) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar la reserva #${idReserva.value} y todos sus registros asociados? Esta acción es irreversible.`)) {
        return;
    }

    saving.value = true; 
    error.value = null;

    try {
        // Llama al endpoint DELETE que creamos previamente
        const response = await $fetch(`/api/admin/eliminar-reserva`, {
            method: 'DELETE',
            query: { id: idReserva.value },
        });

        alert((response as { message: string }).message);
        router.push('/admin/dashboard'); 
    } catch (e: any) {
        console.error('Error al eliminar:', e);
        error.value = e.data?.statusMessage || 'Fallo al eliminar la reserva. Verifique la configuración de CASCADE.';
    } finally {
        saving.value = false;
    }
};

// ------------------------------------
// LIFECYCLE HOOK
// ------------------------------------
onMounted(() => {
    const id = route.query.id as string;
    if (id && !isNaN(parseInt(id))) {
        idReserva.value = parseInt(id);
        fetchReservaData(idReserva.value);
    } else {
        error.value = "ID de reserva no válido.";
        loading.value = false;
    }
});
</script>

<style scoped>
.form-input { 
  width: 100%; 
  padding: 0.75rem; 
  border: 1px solid #d1d5db; 
  border-radius: 0.5rem; 
  outline: none; 
}
.text-purple-dark { color: #4A235A; }
.bg-purple-dark { background-color: #4A235A; }
.bg-purple-light { background-color: #6C3483; }
.bg-purple-deep { background-color: #5C2A72; }
.text-dark-primary-blue { color: #34495e; }
.border-bd-gold-accent { border-color: #FFD700; }
</style>
