// reserve this code for later probable use

import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import axios from 'axios';

import './DNDFormDesigner.css';


// function to reorder the result
const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

/**
 * Moves an item from one list to another list.
 */
 const move = (source, destination, droppableSource, droppableDestination) => {
 	const sourceClone = Array.from(source);
 	const destClone = Array.from(destination);
 	const [removed] = sourceClone.splice(droppableSource.index, 1);

 	destClone.splice(droppableDestination.index, 0, removed);

 	const result = {};
 	result[droppableSource.droppableId] = sourceClone;
 	result[droppableDestination.droppableId] = destClone;

 	return result;
 };

 const grid = 8;

 const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle
  });

 const getListStyle = isDraggingOver => ({
 	background: isDraggingOver ? 'lightblue' : 'lightgrey',
 	padding: grid,
 	width: 250
 });

 class FormDesigner extends Component {
 	constructor(props) {
 		super(props);

 		this.state = {
 			items: props.schema,
 			selected: [],
 		};
 	}


  /**
   * A semi-generic way to handle multiple lists. Matches
   * the IDs of the droppable container to the names of the
   * source arrays stored in the state.
   */
   id2List = {
   	droppable: 'items',
   	droppable2: 'selected'
   };

   getList = id => this.state[this.id2List[id]];

   onDragEnd = result => {
   	const { source, destination } = result;

      // dropped outside the list
      if (!destination) {
      	return;
      }

      if (source.droppableId === destination.droppableId) {
      	const items = reorder(
      		this.getList(source.droppableId),
      		source.index,
      		destination.index
      		);

      	let state = { items };

      	if (source.droppableId === 'droppable2') {
      		state = { selected: items };
      	}

      	this.setState(state);
      } else {
      	const result = move(
      		this.getList(source.droppableId),
      		this.getList(destination.droppableId),
      		source,
      		destination
      		);

      	this.setState({
      		items: result.droppable,
      		selected: result.droppable2
      	});
      }
    };

    // Normally you would want to split things out into separate components.
    // But in this example everything is just done in one place for simplicity
    render() {
    	return (
    		<div className="container-middle">
	    		<DragDropContext onDragEnd={this.onDragEnd}>
	    			<div className="container-dnd">
				  		<Droppable droppableId="droppable">
				  		{(provided, snapshot) => (
				  			<div
					  			className="droppable-column"
					  			ref={provided.innerRef}
					  			style={getListStyle(snapshot.isDraggingOver)}
					  		>
					  			<span className="droppable-column-title">Schema fields</span>
					  			{
					  				this.state.items.map((item, index) => (
					  				<Draggable
					  				key={item.id}
					  				draggableId={item.id}
					  				index={index}>
					  				{
					  					(provided, snapshot) => (
						  					<div
							  					ref={provided.innerRef}
							  					{...provided.draggableProps}
							  					{...provided.dragHandleProps}
							  					style={getItemStyle(
							  						snapshot.isDragging,
							  						provided.draggableProps.style
							  						)}
							  				>
							  					{item.content}
						  					</div>
						  				)
					  				}
					  				</Draggable>
					  				))
					  			}
					  			{provided.placeholder}
				  			</div>
				  			)}
				  		</Droppable>
			    		<Droppable droppableId="droppable2">
			    		{(provided, snapshot) => (
			    			<div
				    			className="droppable-column"
				    			ref={provided.innerRef}
				    			style={getListStyle(snapshot.isDraggingOver)}
				    		>
					  			<span className="droppable-column-title">Selected fields</span>
				    			{
				    				this.state.selected.map((item, index) => (
					    				<Draggable
					    				key={item.id}
					    				draggableId={item.id}
					    				index={index}>
					    				{(provided, snapshot) => (
					    					<div
					    					ref={provided.innerRef}
					    					{...provided.draggableProps}
					    					{...provided.dragHandleProps}
					    					style={getItemStyle(
					    						snapshot.isDragging,
					    						provided.draggableProps.style
					    						)}>
					    					{item.content}
					    					</div>
					    					)}
					    				</Draggable>
					    				))
				    				}
				    			{provided.placeholder}
			    			</div>
			    			)}
			    		</Droppable>
		    		</div>
	    		</DragDropContext>
	    	</div>
    		);
    }
  }

FormDesigner.defaultProps = {
	schema: [
		{
			id: 'task-id',
			content: 'Task ID',
			type: 'Number',
		},
		{
			id: 'task-name',
			content: 'Task Name',
			type: 'String',
		},
		{
			id: 'task-description',
			content: 'Task Description',
			type: 'String',
		},
		{
			id: 'created-time',
			content: 'Created Time',
			type: 'Date',
		},
		{
			id: 'modified-time',
			content: 'Modified Time',
			type: 'Date',
		},
		{
			id: 'task-status',
			content: 'Task Status',
			type: 'String',
		},
		{
			id: 'task-outcome',
			content: 'Task Outcome',
			type: 'String',
		},
		{
			id: 'created-by',
			content: 'Created By',
			type: 'Person',
		},
		{
			id: 'modified-by',
			content: 'Modified By',
			type: 'Person',
		},
		{
			id: 'start-date',
			content: 'Start Date',
			type: 'Date',
		},
		{
			id: 'due-date',
			content: 'Due Date',
			type: 'Date',
		},
		{
			id: 'completion-percentage',
			content: 'Completion Percentage',
			type: 'Number',
		},
		{
			id: 'assigned-to',
			content: 'Assigned To',
			type: 'Person/Group',
		},
		{
			id: 'comments',
			content: 'Comments',
			type: 'String',
		},
		{
			id: 'is-completed',
			content: 'Completed',
			type: 'Boolean',
		},
		{
			id: 'process-id',
			content: 'Process ID',
			type: 'String',
		},
		{
			id: 'process-instance-id',
			content: 'Process Instance ID',
			type: 'String',
		},
	]
}
export default FormDesigner;
