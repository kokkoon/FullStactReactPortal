import React from 'react'

export const arrayFieldTemplate = (props) => {
	const innerObjectProperties = props.items[0] ? props.items[0].children.props.schema.properties : {}
  return (
    <div className="array-field-container">
    	<div className="row">
	    	<div className="col s11">
		    	<table>
						<thead>
							<tr className="array-item-table-head">
							{
								Object.keys(innerObjectProperties).map((property, index) => (
									<th key={index}>{innerObjectProperties[property].title}</th>
								))
							}
							</tr>
						</thead>
					</table>
				</div>
			</div>
      {
      	props.items.map((element, idx1) => {
      		element.children.props.registry.ObjectFieldTemplate = innerObjectFieldTemplate
      		return (
      			<div key={idx1} className="row zero-margin">
	      			<div className="col s11">{element.children}</div>
	      			<div className="btn-actions-container">
		            {element.hasMoveDown && (
		              <span
		              	className="waves-effect waves-light btn btn-action-array-field"
		                onClick={element.onReorderClick(
		                  element.index,
		                  element.index + 1
		                )}>
		                <i className="material-icons">arrow_drop_down</i>
		              </span>
		            )}
		            {element.hasMoveUp && (
		              <span
		              	className="waves-effect waves-light btn btn-action-array-field"
		                onClick={element.onReorderClick(
		                  element.index,
		                  element.index - 1
		                )}>
		                <i className="material-icons">arrow_drop_up</i>
		              </span>
		            )}
		            {element.hasRemove && (
		            	<span 
			            	className="waves-effect waves-light btn btn-action-array-field"
			            	onClick={element.onDropIndexClick(element.index)}>
			              <i className="material-icons">delete</i>
			            </span>
		            )}			            
		          </div>
            </div>
      		)
      	})
      }
      {
      	props.canAdd && 
      	<span className="waves-effect waves-light btn btn-floating red right" onClick={props.onAddClick}>
      		<i className="material-icons">add</i>
      	</span>
      }
    </div>
  )
}

const innerObjectFieldTemplate = (props) => {
	return (
		<table>
		<tbody>
			<tr className="array-object-properties-row">
			{
				props.properties.map((property, idx2) => (
					<td key={idx2}>{property.content}</td>
				))
			}
			</tr>
		</tbody>
		</table>
	)
}