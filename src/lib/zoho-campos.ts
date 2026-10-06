/**
 * Mapeo formulario → módulo «Psicosocial RutaM v2» de Zoho CRM.
 * GENERADO a partir de los metadatos del CRM (getFields) el 2026-10-05.
 * Los valores de las listas son los VALORES INTERNOS (actual_value), que es lo que acepta la API.
 * Si cambian campos u opciones en Zoho, hay que regenerar este archivo.
 */
export const MODULO_ZOHO = "Psicosocial_RutaM_v2";

/** id de pregunta del formulario → nombre API del campo en Zoho */
export const CAMPO_PREGUNTA: Record<string, string> = {
  "p01_motivo": "Cu_l_es_el_motivo_principal_por_el_que_quieres_rec",
  "p01_otro": "Otro_motivo_cu_l",
  "p02_llegada": "C_mo_llegaste_a_este_acompa_amiento",
  "p02_otro": "Otro_cu_l",
  "p03_tratamiento": "Actualmente_est_s_en_un_tratamiento_psicol_gico_o",
  "p03_quien": "Nos_cuentas_brevemente_qui_n_te_acompa_a",
  "p04_pareja": "En_los_ltimos_12_meses_tu_pareja_o_expareja_ha_hec",
  "p05_familiar": "Has_vivido_o_vives_situaciones_de_violencia_en_tu",
  "p05_tipo": "De_qu_tipo1",
  "p06_laboral": "Has_vivido_situaciones_de_violencia_o_acoso_en_tu",
  "p07_comunidad": "Has_vivido_situaciones_de_violencia_en_tu_comunida",
  "p08_convivencia": "C_mo_describir_as_la_convivencia_y_el_apoyo_que_re",
  "p09_personas": "Cu_ntas_personas_sientes_que_tienes_cerca_a_quiene",
  "p10_grupo": "Participas_en_alg_n_grupo_red_comunitaria_religios",
  "p11_cuidado": "Tienes_responsabilidades_de_cuidado_de_ni_os_as_pe",
  "p11_tipo": "A_qui_nes_cuidas",
  "p12_barrera": "Estas_responsabilidades_han_dificultado_tu_permane",
  "p13_apoyo_cuidado": "Cuentas_con_alguien_que_pueda_apoyarte_con_el_cuid",
  "p14_emociones": "En_las_ltimas_dos_semanas_cu_les_de_estas_emocione",
  "p15_situaciones": "Con_cu_les_de_estas_situaciones_te_identificas_act",
  "p15_otra": "Otra_situaci_n_cu_l",
  "p16_afrontamiento": "Cuando_te_sientes_as_qu_sueles_hacer_para_sentirte",
  "p16_otra": "Otra_forma_cu_l",
  "p17_alertas": "Indicadores_de_alerta_has_vivido_alguna_de_estas_s",
  "p18_decisiones": "Sientes_que_puedes_tomar_tus_propias_decisiones_so",
  "p19_dinero": "Qui_n_decide_principalmente_sobre_el_uso_del_diner",
  "p20_ahorro": "Tienes_una_cuenta_de_ahorros_billetera_digital_o_a",
  "p21_libertad_empleo": "Sientes_que_tienes_libertad_para_buscar_o_mantener",
  "p22_control": "Alguien_controla_revisa_o_te_impide_el_acceso_a_tu",
  "p23_ingresos": "Cuentas_con_fuentes_de_ingreso_complementarias_o_a",
  "p24_subsidio": "Recibes_actualmente_alg_n_subsidio_o_apoyo_institu",
  "p24_cual": "Cu_l",
  "p25_vivienda": "En_tu_vivienda_actual_existen_condiciones_de_hacin",
  "p26_barreras": "Marca_hasta_3_barreras_que_sientes_que_m_s_te_difi",
  "p26_otra": "Otra_barrera_cu_l",
  "p27_exp_formal": "Has_trabajado_antes_en_empresas_formales",
  "p27_factores": "Qu_factores_dificultaron_tu_permanencia",
  "p28_fortalezas": "De_esta_lista_marca_las_2_o_3_que_m_s_te_represent",
  "p29_fortalecer": "Cu_les_sientes_que_son_2_o_3_aspectos_que_te_gusta",
  "p30_algo_mas": "Hay_algo_m_s_que_quieras_contarnos_antes_de_tu_lla"
};

/** id de pregunta → (código de opción del formulario → valor interno de la lista en Zoho) */
export const VALOR_OPCION: Record<string, Record<string, string>> = {
  "p01_motivo": {
    "sin_motivo": "Sin motivo específico / quiero conocer el acompañamiento",
    "autoestima": "Autoconcepto y autoestima",
    "tristeza": "Tristeza, frustración o desánimo",
    "violencia_pareja": "Violencia o control por parte de mi pareja o expareja",
    "violencia_entorno": "Violencia en mi familia, trabajo o comunidad",
    "conflictos": "Conflictos en mis relaciones con otras personas",
    "consumo": "Consumo de alcohol u otras sustancias (propio o de alguien cercano) Orientación familiar o de pareja",
    "orientacion_familiar": "Orientación familiar o de pareja",
    "estres_trabajo": "Estrés frente al trabajo o la adaptación a un nuevo empleo",
    "motivacion": "Motivación para lograr mis metas personales o laborales",
    "autonomia": "Autonomía y toma de decisiones sobre mi vida o mi dinero",
    "aprender": "Dificultades para aprender o concentrarme",
    "duelo": "Un duelo o una pérdida reciente",
    "entrevista": "Prepararme para una entrevista o proceso laboral",
    "otro": "Otro"
  },
  "p02_llegada": {
    "propia": "Por mi propia decisión",
    "empresa": "Porque mi empresa o líder me lo sugirió",
    "profesional": "Porque una profesional del programa me lo recomendó",
    "otro": "Otro"
  },
  "p03_tratamiento": {
    "si": "Sí",
    "no": "No",
    "prefiero_no": "Prefiero no responder"
  },
  "p04_pareja": {
    "insulto": "Me ha insultado, humillado o menospreciado delante de otras persona",
    "amenaza": "Me ha amenazado o me ha dado miedo",
    "aislamiento": "Me ha impedido ver a mi familia o amigos",
    "control_economico": "Ha controlado o me ha quitado mi dinero o mis documentos",
    "golpes": "Me ha golpeado, empujado o hecho daño físico",
    "sexual_forzado": "Me ha obligado a tener relaciones sexuales sin que yo quisiera",
    "ninguna": "Ninguna de las anteriores",
    "no_aplica": "No tengo pareja actualmente / no aplica"
  },
  "p05_familiar": {
    "si": "Sí",
    "no": "No"
  },
  "p05_tipo": {
    "fisica": "Física",
    "psicologica": "Psicológica",
    "economica": "Económica",
    "sexual": "Sexual",
    "otra": "Otra"
  },
  "p06_laboral": {
    "si": "Sí",
    "no": "No"
  },
  "p07_comunidad": {
    "si": "Sí",
    "no": "No",
    "no_aplica": "No aplica"
  },
  "p09_personas": {
    "ninguna": "Ninguna",
    "1_2": "1 a 2 personas",
    "3_mas": "3 o más personas"
  },
  "p10_grupo": {
    "si": "Sí",
    "no": "No"
  },
  "p11_cuidado": {
    "si": "Sí",
    "no": "No"
  },
  "p11_tipo": {
    "ninos": "Niños/as",
    "mayores": "Personas mayores",
    "discapacidad": "Personas con discapacidad",
    "otro": "Otro"
  },
  "p12_barrera": {
    "si": "Sí",
    "no": "No",
    "ocasiones": "En ocasiones"
  },
  "p13_apoyo_cuidado": {
    "si": "Si",
    "no": "No"
  },
  "p14_emociones": {
    "tristeza": "Tristeza",
    "culpa": "Culpa",
    "miedo": "Miedo",
    "frustracion": "Frustración",
    "rabia": "Rabia",
    "soledad": "Soledad",
    "humillacion": "Humillación",
    "resentimiento": "Resentimiento",
    "ansiedad": "Ansiedad",
    "desesperanza": "Desesperanza",
    "irritabilidad": "Irritabilidad",
    "apatia": "Apatía / desgano",
    "inseguridad": "Inseguridad",
    "ninguna": "Ninguna de las anteriores, me he sentido bien"
  },
  "p15_situaciones": {
    "motivar": "Me cuesta motivarme",
    "no_valgo": "Siento que no valgo o no confío en mí misma",
    "procrastino": "Dejo las cosas para después y no las termino",
    "expresar": "Me cuesta expresar lo que siento",
    "desconfio": "Desconfío de las personas a mi alrededor",
    "otra": "Otra",
    "ninguna": "Ninguna de las anteriores"
  },
  "p16_afrontamiento": {
    "hablar": "Hablar con alguien de confianza",
    "actividad": "Hacer alguna actividad que me gusta (caminar, música, manualidades, etc.) Buscar ayuda profesional",
    "ayuda_profesional": "Buscar ayuda profesional",
    "orar": "Orar o practicar mi espiritualidad",
    "nada": "Prefiero no hacer nada / se me dificulta manejarlo",
    "otra": "Otra"
  },
  "p17_alertas": {
    "pensamientos_dano": "En las últimas semanas he pensado que no vale la pena seguir, o he tenido ganas de hacerme daño",
    "dormir": "He tenido dificultades importantes para dormir",
    "consumo_descontrol": "He sentido que el consumo de alcohol u otras sustancias se me ha salido de las manos",
    "perdida_control": "He sentido que pierdo el control de mis pensamientos o percibo cosas que otras personas no perciben",
    "ninguna": "Ninguna de las anteriores",
    "prefiero_no": "Prefiero no responder"
  },
  "p18_decisiones": {
    "casi_siempre": "Sí, casi siempre",
    "a_veces": "A veces",
    "casi_nunca": "Casi nunca"
  },
  "p19_dinero": {
    "yo_sola": "Yo sola",
    "conjunto": "En conjunto con alguien más",
    "otra_persona": "Otra persona decide por mí"
  },
  "p20_ahorro": {
    "si": "Sí",
    "no": "No"
  },
  "p21_libertad_empleo": {
    "si": "Sí",
    "no": "No",
    "a_veces": "A veces"
  },
  "p22_control": {
    "si": "Sí",
    "no": "No"
  },
  "p23_ingresos": {
    "si": "Sí",
    "no": "No"
  },
  "p24_subsidio": {
    "si": "Sí",
    "no": "No"
  },
  "p25_vivienda": {
    "si": "Sí",
    "no": "No",
    "prefiero_no": "Prefiero no responder"
  },
  "p26_barreras": {
    "alimentacion_transporte": "Falta de recursos para alimentación o transporte",
    "conocimientos": "Me faltan conocimientos específicos para las vacantes que me interesan |Siento poco fortalecidas mis habilidades",
    "habilidades_vida": "Siento poco fortalecidas mis habilidades",
    "cuidado": "Falta de apoyo para el cuidado de hijos/as u otras personas a cargo",
    "validar_estudios": "Falta de recursos para validar mis estudios",
    "convalidar_titulos": "Falta de recursos para convalidar títulos obtenidos en otro país",
    "internet": "Acceso limitado a internet o herramientas tecnológicas",
    "duelo_migratorio": "Estoy viviendo un proceso de duelo migratorio",
    "riesgo_psicosocial": "Estoy viviendo una situación de riesgo psicosocial",
    "juridico_migratorio": "Tengo procesos jurídicos por resolver relacionados con mi situación migratoria",
    "calamidad": "Una calamidad doméstica reciente",
    "miedo_entrevistas": "Miedo o inseguridad para buscar empleo o presentarme a entrevistas",
    "otra": "Otra"
  },
  "p27_exp_formal": {
    "si": "Sí",
    "no": "No"
  },
  "p27_factores": {
    "externos": "Factores externos",
    "internos": "Factores internos",
    "ambos": "Ambos",
    "otro": "Otro"
  },
  "p28_fortalezas": {
    "agilidad": "Agilidad para ejecutar tareas",
    "estres": "Manejo del estrés en el trabajo",
    "responsabilidad": "Responsabilidad y cumplimiento",
    "tiempo": "Buena gestión del tiempo",
    "adaptacion": "Capacidad de adaptarme a cosas nuevas",
    "equipo": "Trabajo en equipo",
    "conflictos": "Resolver conflictos de forma constructiva",
    "comunicacion": "Comunicación asertiva y escucha",
    "liderazgo": "Liderazgo e iniciativa",
    "proactividad": "Proactividad y disposición para aprender",
    "compromiso": "Compromiso con lo que hago",
    "motivacion": "Motivación para lograr metas"
  },
  "p29_fortalecer": {
    "procrastinacion": "Terminar lo que empiezo (procrastinación)",
    "asertividad": "Comunicación asertiva",
    "liderar": "Seguridad para liderar o decidir",
    "pertenencia": "Sentido de pertenencia con la empresa o el equipo",
    "motivacion": "Sostener mi motivación en el tiempo",
    "compromisos": "Cumplir mis compromisos",
    "cambios": "Adaptarme mejor a los cambios",
    "conflictos": "Resolver conflictos con otras personas"
  }
};

/** Campos de resultado, estado y metadatos */
export const CAMPO_RESULTADO = {
  "nombre": "Name",
  "participante": "Participante",
  "estado": "Estado_del_diagn_stico",
  "fuente": "Fuente_del_diagn_stico",
  "nivel": "Nivel_de_riesgo_autom_tico",
  "banderas": "Banderas_rojas_activas",
  "alertaInmediata": "Alerta_prioritaria_inmediata",
  "alertaNaranja": "Alerta_de_revisi_n_posible_control_econ_mico",
  "puntajeTotal": "Puntaje_total_0_100",
  "puntajeEje": {
    "1": "Puntaje_Eje_1_Violencias_0_30",
    "2": "Puntaje_Eje_2_Redes_de_apoyo_0_20",
    "3": "Puntaje_Eje_3_Bienestar_emocional_0_20",
    "4": "Puntaje_Eje_4_Autonom_a_0_15",
    "5": "Puntaje_Eje_5_Barreras_0_151"
  },
  "porcentajeEje": {
    "1": "Eje_1_Violencias",
    "2": "Eje_2_Redes_de_apoyo",
    "3": "Eje_3_Bienestar_emocional",
    "4": "Eje_4_Autonom_a",
    "5": "Eje_5_Barreras"
  }
} as const;

/** Bandera roja del motor de puntaje → valor de la lista «Banderas rojas activas» */
export const VALOR_BANDERA: Record<string, string> = {
  "P4_violencia_fisica_o_sexual_pareja": "P4 Golpes/daño físico o sexual forzado por pareja",
  "P5_violencia_familiar_fisica_o_sexual": "P5 Violencia familiar física o sexual",
  "P17_pensamientos_dano": "P17 Pensamientos de hacerse daño",
  "P17_consumo_descontrolado": "P17 Consumo fuera de control",
  "P17_perdida_control_pensamientos": "P17 Pérdida de control de pensamientos"
};

export const ESTADO_DILIGENCIADO = "Diligenciado";
export const FUENTE_AUTOAPLICADO = "Autoaplicado en línea";

export const ESTADO_ENLACE_ENVIADO = "Enlace enviado";
