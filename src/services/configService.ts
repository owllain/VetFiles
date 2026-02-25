
export interface AppointmentTypeConfig {
  id: string;
  label: string;
  duration: number;
  color: string;
  icon: string;
}

const DEFAULT_TYPES: AppointmentTypeConfig[] = [
  { id: 'Consulta', label: 'Consulta', duration: 30, color: 'bg-primary', icon: 'stethoscope' },
  { id: 'Vacuna', label: 'Vacuna', duration: 20, color: 'bg-emerald-500', icon: 'vaccines' },
  { id: 'Cirugía', label: 'Cirugía', duration: 120, color: 'bg-secondary', icon: 'precision_manufacturing' },
  { id: 'Examen', label: 'Examen', duration: 30, color: 'bg-accent', icon: 'biotech' },
];

export const configService = {
  getAppointmentTypes: (): AppointmentTypeConfig[] => {
    const saved = localStorage.getItem('vet_appointment_types');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_TYPES;
      }
    }
    return DEFAULT_TYPES;
  },

  saveAppointmentTypes: (types: AppointmentTypeConfig[]) => {
    localStorage.setItem('vet_appointment_types', JSON.stringify(types));
  }
};
