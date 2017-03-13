import React from 'react'
import { Col, Image, Button } from 'react-bootstrap'
import { FaHeart, FaHeartO } from 'react-icons/lib/fa';
import { remove, update } from '../models'
import { ObjectToArray } from '../Commen'
import { connect } from 'react-redux'
import { Card, CardMedia, CardTitle, CardText } from 'react-toolbox/lib/card';
import Slider from 'react-slick'

export class OneFlyer extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            liked:false
        }
        this.onLike = this.onLike.bind(this)
    }

    userLoggedInAsStudentNotLikedFlyer(){
        const { isAuthenticated, isOrg, FlyersLiked } = this.props.user
        const { id } = this.props.flyer
        return isAuthenticated && !isOrg && !FlyersLiked.hasOwnProperty(id)
    }

    userLoggedInAsStudentLikedFlyer(){
        const { isAuthenticated, isOrg, FlyersLiked } = this.props.user
        const { id } = this.props.flyer
        return isAuthenticated && !isOrg && FlyersLiked.hasOwnProperty(id)
    }

    onLike(){
        const { uid } = this.props.user
        const { id, likes } = this.props.flyer
        var newFlyer = {}
        newFlyer[`${id}`] = id


        if(this.userLoggedInAsStudentNotLikedFlyer()){
            //update method will only update the field, not overwriting the whol thing
            update(`users/${uid}/FlyersLiked`, newFlyer)
            update(`events/${id}`, {likes: likes + 1})
        }
        if(this.userLoggedInAsStudentLikedFlyer()){
            remove(`users/${uid}/FlyersLiked/${id}`)
            update(`events/${id}`, {likes: likes - 1})
        }

    }

    render() {
        const {
            name,
            location,
            description,
            date,
            images,
            likes
        } = this.props.flyer

        //prepare the images
        const imagesArray = ObjectToArray(images)
        var CarouselItems = <Image src={imagesArray[0].imageUrl || imagesArray[0].preview} width={350} responsive/>
        var carouselInstance = CarouselItems;

        if (imagesArray.length > 1) {
          CarouselItems = imagesArray.map(function(image, index){
                  return (
                      <div key={index}>
                          <Image src={image.imageUrl || image.preview} width={350} responsive/>
                      </div>
                  )
          })
          let settings = {
            className: '',
            dots: true,
            infinite: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            adaptiveHeight: true,
            autoplay: true,
            arrow: false,
            swipe: true
          };
          carouselInstance = (
            <Slider
            {...settings}
            >
            {CarouselItems}
            </Slider>)
       }

        //prepare the liked state of the button
        var isLiked = this.state.liked
        if(this.userLoggedInAsStudentLikedFlyer()){ //don't allow org to like flyers
            isLiked = true
        }
        if(this.userLoggedInAsStudentNotLikedFlyer()){
            isLiked = false
        }

        //prepare the like button
        const btnColor =  isLiked ? 'danger' : 'info'
        const HeatIcon =  isLiked ?  FaHeart : FaHeartO
        const titleAndBtn = (
            <div>
                <br/>
                {name}
                <span className='pull-right'>
                    <Button onClick={this.onLike} bsStyle={btnColor}>
                        <HeatIcon/>{likes}
                    </Button>
                </span>
            </div>
        )

        /**/
        return(
            <Col xs={12} sm={12} md={3} >
            <Card raised={true} style={{boxShadow: "10px 10px 10px grey"}}>
                <CardMedia
                    aspectRatio="wide"
                    children={carouselInstance}
                />
                <CardTitle
                    title={titleAndBtn}
                    subtitle={`Date: ${date} @${location}`}
                />
                <CardText>
                    {description}
                </CardText>
            </Card>


            </Col>
        )
    }
}

function mapStateToProps(state){
    return{
        user: state.user
    }
}

const Flyer = connect(mapStateToProps)(OneFlyer)

export { Flyer }
