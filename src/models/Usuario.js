class Usuario {
    #contrasena;
    constructor(id, nombre, apellido, correo, contrasena) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.#contrasena = contrasena;
    }
}

export default Usuario;