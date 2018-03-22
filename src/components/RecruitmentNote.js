import React from 'react';
import { Panel, Button, Modal, Row, Col } from 'react-bootstrap';
import { FaCalendar, FaGroup, FaEnvelope, FaStreetView } from 'react-icons/lib/fa';
// import { Link } from 'react-router'
import { ColCenter, ObjectToArray } from '../commons'
import { remove, update } from '../firebase'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { activeDate } from '../commons'
import Alert from 'react-s-alert';


class OneRecruitmentNote extends React.Component {

    constructor(props){
        super(props)
        this.state={
          liked: false,
          showModel:false,
          showLogin: false
        }
        this.onDelete = this.onDelete.bind(this)
        this.onLike = this.onLike.bind(this)
    }
    
    orgUserDeleteFlyer(){
        const { isAuthenticated, isOrg, RecruitmentNotesCreated } = this.props.user
        const { id } = this.props.data
        return isAuthenticated && isOrg && RecruitmentNotesCreated.hasOwnProperty(id)
    }
   
    userLoggedInAsStudentNotLikedFlyer(){
        const { isAuthenticated, isOrg, RecruitmentNotesSaved } = this.props.user
        const { id } = this.props.data
        return isAuthenticated && !isOrg && !RecruitmentNotesSaved.hasOwnProperty(id)
    }

    userLoggedInAsStudentLikedFlyer(){
        const { isAuthenticated, isOrg, RecruitmentNotesSaved } = this.props.user
        const { id } = this.props.data
        return isAuthenticated && !isOrg && RecruitmentNotesSaved.hasOwnProperty(id)
    } 

    onLike(){
        const { uid, isAuthenticated, isOrg } = this.props.user
        if(!isAuthenticated){
           return this.setState({showLogin: true})
        }
        if(isAuthenticated && isOrg){
          Alert.warning('Orgs don\'t save recruitmentNote. Only students do');
          return null
        }
        const { id } = this.props.data
        var newRec = {}
        newRec[`${id}`] = id

        if(this.userLoggedInAsStudentNotLikedFlyer()){
            //update method will only update the field, not overwriting the whol thing
            update(`users/${uid}/RecruitmentNotesSaved`, newRec)
            // update(`events/${id}`, {likes: likes + 1})
        }
        if(this.userLoggedInAsStudentLikedFlyer()){
            remove(`users/${uid}/RecruitmentNotesSaved/${id}`)
            // update(`events/${id}`, {likes: likes - 1})
        }

    }

    onDelete(){
        const { hasOrg, uid } = this.props.user
        const { id } = this.props.data
        if(this.orgUserDeleteFlyer()){
            remove(`users/${uid}/RecruitmentNotesCreated/${id}`)
            remove(`recruitmentNotes/${id}`)
            remove(`clubs/${hasOrg}/belongsTo/RecruitmentNotesCreated/${id}`)
        }
        this.setState({showModel:false})
    }
    

    render(){
      const { RecruitmentNotesCreated } = this.props.user
      const { seeking, clubName, dueDate, email, description, id } = this.props.data
      const recruitmentNotesArray = ObjectToArray(RecruitmentNotesCreated)
      var displayDelete = false
      if(recruitmentNotesArray.includes(id)){
        displayDelete = true
      }
      const deleteBtn = (
        <div>
            <span className='pull-right'>
                <Button onClick={()=>this.setState({showModel:true})} bsStyle={'danger'}>
                    Delete
                </Button>
            </span>
        </div>
      )

        //prepare the liked state of the button
        var isLiked = this.state.liked
        if(this.userLoggedInAsStudentLikedFlyer()){ //don't allow org to like flyers
            isLiked = true
        }
        if(this.userLoggedInAsStudentNotLikedFlyer()){
            isLiked = false
        }
        const btnColor =  isLiked ? 'danger' : 'info'
        // const HeatIcon =  isLiked ?  FaHeart : FaHeartO
        const title = isLiked ? 'Unsave' : 'Save'
        const titleAndLikeBtn = (
            <div>
                {/*name*/}
                <span className='pull-right'>
                    <Button onClick={this.onLike} bsStyle={btnColor}>
                        {title}
                    </Button>
                </span>
            </div>
        )
        var ToRender = <span/>
        const isActive = activeDate(dueDate)
        if(isActive){
            ToRender = (
                <Panel bsStyle='info' header={clubName + ' seeking ' + seeking}>
                  <ColCenter>
                      <h5><FaStreetView/> {seeking}</h5>
                      <h5><FaCalendar/> Due date: {dueDate} <br/></h5>
                      <h5><FaGroup/> Organization: {clubName} <br/></h5>
                      <h5><FaEnvelope/> Email: {email} <br/></h5>
                      <p>{description}</p>
                      <Row >
                        <Col sm={1} md={1}>
                          {titleAndLikeBtn}
                        </Col>
                        {displayDelete ? 
                          <Col smOffset={2} sm={1}  md={1}>
                            {deleteBtn}
                          </Col>
                            : " "}
                      </Row>
                  </ColCenter>
                  <div>
                      <Modal show={this.state.showModel}>
                          <Modal.Title>
                          <p style={{color:'darkRed', fontWeight:'bold'}} className="text-center"> Are you sure you want to delete this?</p>
                          </Modal.Title>
                          <Modal.Footer>
                              <Button bsStyle='success' onClick={()=>this.setState({showModel:false})}>Cancel</Button>
                              <Button bsStyle='danger' onClick={this.onDelete}>DELETE</Button>
                          </Modal.Footer>
                      </Modal>
                  </div>
                  <div>
                      <Modal show={this.state.showLogin}>
                          <Modal.Title>
                              <p className="text-center">Save RecruitmentNotes requires being logged in.<br/> Would you like to be our user?</p>
                          </Modal.Title>
                          <Modal.Footer>
                              <Link to='login' className='btn btn-success'>Login</Link>
                              <Button onClick={()=>this.setState({showLogin:false})}>Cancel</Button>
                          </Modal.Footer>
                      </Modal>
                  </div>
                </Panel>
            )
        }
      return (
        <span> {ToRender} </span>
        )
    }
}

OneRecruitmentNote.propTypes = {
    data: React.PropTypes.any.isRequired
};

function mapStateToProps(state){
    return{
        user: state.user
    }
}

const RecruitmentNote = connect(mapStateToProps)(OneRecruitmentNote)

export { RecruitmentNote };
