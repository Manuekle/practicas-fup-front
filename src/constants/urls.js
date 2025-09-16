export const LISTA_CONVENIO_URL = '/agreements'
export const OBTENER_CONVENIO_URL = (id) => `/agreements/${id}`
export const OBTENER_DOCUMENTOS_CONVENIO_URL = (id) => `/agreements/${id}/documents`
export const CARGAR_DOCUMENTOS_CONVENIO_URL = (id) => `/agreements/${id}/documents/upload`
export const CREAR_CONVENIO_URL = LISTA_CONVENIO_URL
export const ACTUALIZAR_CONVENIO_URL = OBTENER_CONVENIO_URL
export const ACTUALIZAR_ESTADO_DOCUMENTO_CONVENIO = (convenioId, documentoId) => `/agreements/${convenioId}/documents/${documentoId}/update-status`
export const ACTUALIZAR_ESTADO_CONVENIO = (id) => `/agreements/${id}/toggle-status`

export const LISTA_PROGRAMAS_URL = '/programs'
export const CREAR_PROGRAMA_URL = LISTA_PROGRAMAS_URL
export const OBTENER_PROGRAMA_URL = (id) => `/programs/${id}`
export const ACTUALIZAR_PROGRAMA_URL = OBTENER_PROGRAMA_URL

export const LISTA_PRACTICA_URL = '/practices'

export const LISTA_ESTUDIANTE_URL = '/students'
export const CREAR_ESTUDIANTE_URL = LISTA_ESTUDIANTE_URL
export const OBTENER_ESTUDIANTE_URL = (id) => `/students/${id}`
export const ACTUALIZAR_ESTUDIANTE_URL = OBTENER_ESTUDIANTE_URL

export const LISTA_DOCENTE_URL = '/teachers'
export const CREAR_DOCENTE_URL = LISTA_DOCENTE_URL
export const OBTENER_DOCENTE_URL = (id) => `/teachers/${id}`
export const ACTUALIZAR_DOCENTE_URL = OBTENER_DOCENTE_URL

export const LISTA_EMPRESAS_URL = '/companies'
export const REGISTRAR_EMPRESAS_URL = LISTA_EMPRESAS_URL
export const ACTUALIZAR_EMPRESAS_URL = (id) => `/companies/${id}`
export const OBTENER_EMPRESAS_URL = ACTUALIZAR_EMPRESAS_URL

export const LISTA_DOCUMENTOS_URL = '/documents'
export const CREAR_DOCUMENTOS_URL = LISTA_DOCUMENTOS_URL
export const ACTUALIZAR_DOCUMENTOS_URL = (id) => `/documents/${id}`
export const OBTENER_DOCUMENTOS_URL = ACTUALIZAR_DOCUMENTOS_URL
export const ACTUALIZAR_ESTADO_DOCUMENTO = (id) => `/documents/${id}/toggle-status` 

export const LISTA_SUSTENTACIONES_URL = '/defenses'
export const CREAR_SUSTENTACION_URL = LISTA_SUSTENTACIONES_URL
export const OBTENER_SUSTENTACION_URL = (id) => `/defenses/${id}`
export const ACTUALIZAR_SUSTENTACION_URL = OBTENER_SUSTENTACION_URL
export const COMENTARIO_SUSTENTACION_URL = (id ) => `/defenses/${id}/comments`
export const REPROGRAMAR_SUSTENTACION_URL = (id) => `/defenses/${id}/reschedule`
export const FINALIZAR_SUSTENTACION = (id) => `/defenses/${id}/finish`

export const OBTENER_PRACTICA_URL = (id) => `/practices/${id}`
export const LISTA_TEACHER_URL = '/teachers'
export const CREAR_PRACTICA_URL = '/practices'
export const CREAR_SEGUIMIENTO_URL = (id) => `/practices/${id}/internship-trackings`

export const LISTA_OFERTAPRACTICA_URL = '/practical-offers'
export const CREAR_OFERTAPRACTICA_URL = '/practical-offers' 
export const ACTUALIZAR_OFERTAPRACTICA_URL = (id) => `/practical-offers/${id}`
export const OBTENER_OFERTAPRACTICA_URL = (id) => `/practical-offers/${id}`

export const CAMBIAR_PASSWORD_URL = '/auth/users/set_password/'
export const VALIDAR_CONTRASENA_URL = '/auth/users/validate-password'
export const RECUPERAR_CONTRASENA_URL = '/auth/users/reset_password_confirm/' // Url para la confirmación de la nueva contraseña
export const SOLICITAR_RECUPERAR_CONTRASENA = '/auth/users/reset_password/'
export const VALIDAR_NUMERO_DOCUMENTO = '/auth/users/validate-document-number'
export const REGISTRARSE = '/auth/users/register'
export const OBTENER_PERMISOS = '/auth/users/permissions'

// Urls de reportes
export const ESTADISTICAS_CONVENIO =  '/reports/agreements/stats'
export const ESTADOS_CONVENIO = '/reports/agreements/status'
export const PROXIMOS_A_VENCER_CONVENIO = '/reports/agreements/expiration'
export const CONVENIOS_POR_ANIO = '/reports/agreements/by-year'
export const CONVENIOS_POR_PROGRAMA_ACADEMICO = '/reports/agreements/per-program'
export const CONVENIOS_ESTUDIANTES= '/reports/agreements/students'
export const SUSTENTACIONES = '/reports/defenses/complete'

// Urls de usuarios
export const LISTA_USUARIOS = '/users'
export const CREAR_USUARIO  = LISTA_USUARIOS
export const OBTERNER_USUARIO = (id) => `/users/${id}`
export const ACTUALIZAR_USUARIO = OBTERNER_USUARIO
export const ACTIVARINACTIVAR_USUARIO = (id) => `/users/${id}/toggle-status`

export const LISTA_ROLES = '/roles'
export const CREAR_ROL = LISTA_ROLES
export const OBTENER_ROL = (id) => `/roles/${id}`
export const ACTUALIZAR_ROL = OBTENER_ROL
export const PERMISOS = '/permissions'