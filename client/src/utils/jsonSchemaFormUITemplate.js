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
	      			<div className="col s11">
	      				{element.children}
	      			</div>
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
      <div className="row total-amount-container">
	      <div className="col s11">
					<span id="total-amount-array-items" className="col s3 right total-amount-cell"></span>
					<span className="col s3 right total-amount-cell">Total</span>
	    	</div>
	    </div>
      {
      	props.canAdd && 
      	<span 
      		className="waves-effect waves-light btn btn-floating red right" 
      		onClick={e => handleClickAdd(e, props)}
      	>
      		<i className="material-icons">add</i>
      	</span>
      }
    </div>
  )
}

const handleClickAdd = (e, props) => {
	props.onAddClick(e)

	const delay = setInterval(() => {
		// fix hidden dropdown select due to materializecss override script
		// by adding 'browser-default' class
		addBrowserDefaultClassOnSelectElements() 
		clearInterval(delay)
	}, 50)
}

const addBrowserDefaultClassOnSelectElements = () => {
	const selects = document.getElementsByTagName('SELECT')
	if (selects.length > 0) {
		for (let i = 0; i < selects.length; i++) {
			selects[i].classList.add('browser-default')
		}
	}
}

const innerObjectFieldTemplate = (props) => {
	return (
		<table>
		<tbody>
			<tr className="array-object-properties-row">
			{
				props.properties.map((property, idx2) => (
					<td key={idx2} className={`${property.name}-cell`}>{property.content}</td>
				))
			}
			</tr>
		</tbody>
		</table>
	)
}