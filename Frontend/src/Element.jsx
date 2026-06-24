import React from 'react'
import './Element.css'
import{Link} from 'react-router-dom'
import Selement from './Selement'
const Element = (props) => {
  return (
    <div className='Product'>
      <h1>{props.name}</h1>
      <h4>{props.id}</h4>
      <h3>${props.price}</h3>
      <Link to={`/${props.id}`}>more</Link>
    </div>
  )
}

export default Element