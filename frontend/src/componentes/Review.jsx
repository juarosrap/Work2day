import { useEffect } from "react";
import "../styles/Profile.css";

export default function Review({ review }){

    //useEffect(() => {
        //async function getPerson(){
        //    const API = `http://localhost:5000/api/usuarios/${review.empleadorId || review.}`
      //  }

    //    getPerson();
    //},[])
    console.log(review)
    return (
        <div className="review">
            <img src="ruta-a-imagen-carlos.png" alt="Candidato" />
            <div className="review-content">
              <p className="review-name">{review.empleadorId.nombre}</p>
              <p className="review-role">{review.empleadorId ? "Empleador" : "Candidato"}</p>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="review-text">
                {review.comentario}
              </p>
            </div>
          </div>
    )
}