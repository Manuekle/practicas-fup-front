

export const formatDate = (isoDate, format = "DD/MM/YYYY HH:mm") => {
    if (!isoDate) return "";
  
    const fecha = new Date(isoDate);
    
    const opciones = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
  
    if (format === "DD/MM/YYYY") {
      return fecha.toLocaleDateString("es-ES");
    } else if (format === "DD/MM/YYYY HH:mm") {
      return fecha.toLocaleDateString("es-ES", opciones).replace(",", "");
    }
  
    return fecha.toISOString(); // Default: ISO format
  };
  