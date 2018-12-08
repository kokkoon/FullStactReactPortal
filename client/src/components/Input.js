import React from 'react';

const Input = (props) => (
	<div class="row">
    <div class="col s12">
      <div class="row">
        <div class="input-field col s12">
          <input 
          	type="text" 
          	id="autocomplete-input" 
          	class="autocomplete" 
          	onChange={props.onChange} 
          	value={props.value}/>
          <label for="autocomplete-input">{props.autocomplete}</label>
        </div>
      </div>
    </div>
  </div>
);

export default Input;
