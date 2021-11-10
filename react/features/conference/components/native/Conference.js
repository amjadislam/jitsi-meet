// @flow

import React from 'react';
import { NativeModules, Platform, SafeAreaView, StatusBar, NativeEventEmitter, View } from 'react-native';


import { appNavigate } from '../../../app/actions';
import { PIP_ENABLED, FULLSCREEN_ENABLED, getFeatureFlag } from '../../../base/flags';
import { MEDIA_TYPE } from '../../../base/media';
import { pinParticipant } from '../../../base/participants';
import { Container, LoadingIndicator, TintedView } from '../../../base/react';
import { connect } from '../../../base/redux';
import { ASPECT_RATIO_NARROW } from '../../../base/responsive-ui/constants';
import { TestConnectionInfo } from '../../../base/testing';
import {
    getTrackByMediaTypeAndParticipant,
    isLocalCameraTrackMuted
} from '../../../base/tracks';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from '../../../base/util/responsiveLayout';
import { ConferenceNotification, isCalendarEnabled } from '../../../calendar-sync';
import { Chat } from '../../../chat';
import { DisplayNameLabel } from '../../../display-name';
import { SharedDocument } from '../../../etherpad';
import {
    FILMSTRIP_SIZE,
    Filmstrip,
    isFilmstripVisible,
    TileView
} from '../../../filmstrip';
import LocalThumbnail
    from '../../../filmstrip/components/native/LocalThumbnail';
import { AddPeopleDialog, CalleeInfoContainer } from '../../../invite';
import { LargeVideo } from '../../../large-video';
import { KnockingParticipantList } from '../../../lobby';
import { LobbyScreen } from '../../../lobby/components/native';
import { getIsLobbyVisible } from '../../../lobby/functions';
import { BackButtonRegistry } from '../../../mobile/back-button';
import { ParticipantsPane } from '../../../participants-pane/components/native';
import { Captions } from '../../../subtitles';
import { setToolboxVisible } from '../../../toolbox/actions';
import { Toolbox } from '../../../toolbox/components/native';
import { isToolboxVisible } from '../../../toolbox/functions';
import {
    AbstractConference,
    abstractMapStateToProps
} from '../AbstractConference';
import type { AbstractProps } from '../AbstractConference';

import LonelyMeetingExperience from './LonelyMeetingExperience';
import NavigationBar from './NavigationBar';
import styles from './styles';
import {muteLocal} from "../../../video-menu/actions.any";


/**
 * The type of the React {@code Component} props of {@link Conference}.
 */
type Props = AbstractProps & {

    /**
     * Application's aspect ratio.
     */
    _aspectRatio: Symbol,

    /**
     * Wherther the calendar feature is enabled or not.
     */
    _calendarEnabled: boolean,

    /**
     * The indicator which determines that we are still connecting to the
     * conference which includes establishing the XMPP connection and then
     * joining the room. If truthy, then an activity/loading indicator will be
     * rendered.
     */
    _connecting: boolean,

    /**
     * Set to {@code true} when the filmstrip is currently visible.
     */
    _filmstripVisible: boolean,

    /**
     * The indicator which determines whether fullscreen (immersive) mode is enabled.
     */
    _fullscreenEnabled: boolean,

    /**
     * The indicator which determines if the participants pane is open.
     */
    _isParticipantsPaneOpen: boolean,

    /**
     * The ID of the participant currently on stage (if any).
     */
    _largeVideoParticipantId: string,

    /**
     * Whether Picture-in-Picture is enabled.
     */
    _pictureInPictureEnabled: boolean,

    /**
     * The indicator which determines whether the UI is reduced (to accommodate
     * smaller display areas).
     */
    _reducedUI: boolean,

    /**
     * The indicator which determines whether the Toolbox is visible.
     */
    _toolboxVisible: boolean,

    /**
     * Indicates whether the lobby screen should be visible.
     */
    _showLobby: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function
};

/**
 * The conference page of the mobile (i.e. React Native) application.
 */
class Conference extends AbstractConference<Props, *> {
    /**
     * Initializes a new Conference instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onClick = this._onClick.bind(this);
        this._onHardwareBackPress = this._onHardwareBackPress.bind(this);
        this._setToolboxVisible = this._setToolboxVisible.bind(this);
    }

    /**
     * Implements {@link Component#componentDidMount()}. Invoked immediately
     * after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        const { dispatch, _participants, _tracks } = this.props;

        // TODO: This code is not working and only here for testing...
        // const eventEmitter = new NativeEventEmitter();

        // TODO: This code was causing issue with AudioCall Mode...
        // setTimeout(() => dispatch(muteLocal(true, MEDIA_TYPE.AUDIO)), 4 * 1000);

        // TODO: This code is not working and only here for testing...
        // this.eventListener = eventEmitter.addListener('onMuteAllEvent', event => {
        //     console.log('===> Event(onMuteAllEvent) Received!!!!!!', JSON.stringify(event));
        //     console.log('===> Event(onMuteAllEvent) Received ===> ', JSON.parse(event).should_mute);
        //
        //     // if (event.call_status === '1') {
        //     //     onCallAccepted(JSON.parse(event.call_data));
        //     // }
        // });

        BackButtonRegistry.addListener(this._onHardwareBackPress);

        // setTimeout(() => {
        // if(!this.props._videoMuted) {
        //     console.log('Must be broadcaster!');
        //     if(_participants[0].pinned) {
        //         console.log('Already Pinned!!!');
        //     } else {
        //         console.log(JSON.stringify(_participants[0]));
        //         console.log('_participants[0].id: ',_participants[0].id,' Pinned!!!');
        //         dispatch(pinParticipant(_participants[0].id));
        //     }
        // } else {
        //     console.log('Listener!');
        _participants.forEach((p, index) => {
            const videoTrack
                = getTrackByMediaTypeAndParticipant(_tracks, MEDIA_TYPE.VIDEO, p.id);

            if (!videoTrack.muted) {
                dispatch(pinParticipant(p.id));
            }
        });

        // }
        // }, 5 * 1000);
        //
        // let context = this;
        // setTimeout(() => {
        //     context.props.dispatch({
        //         type: 'TOGGLE_CHAT'
        //     });
        // }, 5000);
    }

    /**
     * Implements {@link Component#componentWillUnmount()}. Invoked immediately
     * before this component is unmounted and destroyed. Disconnects the
     * conference described by the redux store/state.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        if (Platform.OS === 'android') {
            // if (this.eventListener !== null) {
            //     this.eventListener.remove();
            // }
        }

        // Tear handling any hardware button presses for back navigation down.
        BackButtonRegistry.removeListener(this._onHardwareBackPress);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _fullscreenEnabled, _showLobby } = this.props;

        if (_showLobby) {
            return <LobbyScreen />;
        }

        return (
            <Container style = { styles.conference }>
                <StatusBar
                    barStyle = 'light-content'
                    hidden = { _fullscreenEnabled }
                    translucent = { _fullscreenEnabled } />
                { this._renderContent() }
            </Container>
        );
    }

    _onClick: () => void;

    /**
     * Changes the value of the toolboxVisible state, thus allowing us to switch
     * between Toolbox and Filmstrip and change their visibility.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        this._setToolboxVisible(!this.props._toolboxVisible);
    }

    _onHardwareBackPress: () => boolean;

    /**
     * Handles a hardware button press for back navigation. Enters Picture-in-Picture mode
     * (if supported) or leaves the associated {@code Conference} otherwise.
     *
     * @returns {boolean} Exiting the app is undesired, so {@code true} is always returned.
     */
    _onHardwareBackPress() {
        let p;

        if (this.props._pictureInPictureEnabled) {
            const { PictureInPicture } = NativeModules;

            p = PictureInPicture.enterPictureInPicture();
        } else {
            p = Promise.reject(new Error('PiP not enabled'));
        }

        p.catch(() => {
            this.props.dispatch(appNavigate(undefined));
        });

        return true;
    }

    /**
     * Renders JitsiModals that are supposed to be on the conference screen.
     *
     * @returns {Array<ReactElement>}
     */
    _renderConferenceModals() {
        return [
            <AddPeopleDialog key = 'addPeopleDialog' />,
            <Chat key = 'chat' />,
            <SharedDocument key = 'sharedDocument' />
        ];
    }

    /**
     * Renders the conference notification badge if the feature is enabled.
     *
     * @private
     * @returns {React$Node}
     */
    _renderConferenceNotification() {
        const { _calendarEnabled, _reducedUI } = this.props;

        return (
            _calendarEnabled && !_reducedUI
                ? <ConferenceNotification />
                : undefined);
    }

    /**
     * Renders the content for the Conference container.
     *
     * @private
     * @returns {React$Element}
     */
    _renderContent() {
        const {
            _connecting,
            _isParticipantsPaneOpen,
            _largeVideoParticipantId,

            // _reducedUI,
            _shouldDisplayTileView
        } = this.props;

        // if (_reducedUI) {
        //     return this._renderContentForReducedUi();
        // }

        return (
            <>
                {/*
                  * The LargeVideo is the lowermost stacking layer.
                  */
                    // _shouldDisplayTileView
                    //     ? <TileView onClick = { this._onClick } />
                    //     : <LargeVideo onClick = { this._onClick } />
                    this.props._videoMuted
                        ? <LargeVideo onClick = { this._onClick } />
                        : <LocalThumbnail />
                }

                {/*
                  * If there is a ringing call, show the callee's info.
                  */
                    // <CalleeInfoContainer />
                }

                {/*
                  * The activity/loading indicator goes above everything, except
                  * the toolbox/toolbars and the dialogs.
                  */
                    _connecting
                        && <TintedView>
                            <LoadingIndicator />
                        </TintedView>
                }

                <View
                    pointerEvents = 'box-none'
                    style = { styles.toolboxAndFilmstripContainer }>

                     {/*<Captions onPress = { this._onClick } />*/}

                     {/*{ _shouldDisplayTileView || <Container style = { styles.displayNameContainer }>*/}
                     {/*   <DisplayNameLabel participantId = { _largeVideoParticipantId } />*/}
                     {/*</Container> }*/}

                     {/*<LonelyMeetingExperience />*/}

                    <Toolbox />
                    {/* { _shouldDisplayTileView*/}
                    {/* || <>*/}
                    {/*     <Filmstrip />*/}
                    {/*    <Toolbox />*/}
                    {/* </>*/}
                    {/* }*/}
                </View>

                 {/*<SafeAreaView*/}
                 {/*   pointerEvents = 'box-none'*/}
                 {/*   style = { styles.navBarSafeView }>*/}
                 {/*   <NavigationBar />*/}
                 {/*   { this._renderNotificationsContainer() }*/}
                 {/*   <KnockingParticipantList />*/}
                 {/*</SafeAreaView>*/}

                {/* <TestConnectionInfo />*/}
                {/* { this._renderConferenceNotification() }*/}

                {/* { this._renderConferenceModals() }*/}

                {/* {_shouldDisplayTileView && <Toolbox />}*/}

                {/* { _isParticipantsPaneOpen && <ParticipantsPane /> }*/}

            </>
        );
    }

    /**
     * Renders the content for the Conference container when in "reduced UI" mode.
     *
     * @private
     * @returns {React$Element}
     */
    _renderContentForReducedUi() {
        const { _connecting } = this.props;

        return (
            <>
                <LargeVideo onClick = { this._onClick } />

                {
                    _connecting
                        && <TintedView>
                            <LoadingIndicator />
                        </TintedView>
                }
            </>
        );
    }

    /**
     * Renders a container for notifications to be displayed by the
     * base/notifications feature.
     *
     * @private
     * @returns {React$Element}
     */
    _renderNotificationsContainer() {
        const notificationsStyle = {};

        // In the landscape mode (wide) there's problem with notifications being
        // shadowed by the filmstrip rendered on the right. This makes the "x"
        // button not clickable. In order to avoid that a margin of the
        // filmstrip's size is added to the right.
        //
        // Pawel: after many attempts I failed to make notifications adjust to
        // their contents width because of column and rows being used in the
        // flex layout. The only option that seemed to limit the notification's
        // size was explicit 'width' value which is not better than the margin
        // added here.
        const { _aspectRatio, _filmstripVisible } = this.props;

        if (_filmstripVisible && _aspectRatio !== ASPECT_RATIO_NARROW) {
            notificationsStyle.marginRight = FILMSTRIP_SIZE;
        }

        return super.renderNotificationsContainer(
            {
                style: notificationsStyle
            }
        );
    }

    _setToolboxVisible: (boolean) => void;

    /**
     * Dispatches an action changing the visibility of the {@link Toolbox}.
     *
     * @private
     * @param {boolean} visible - Pass {@code true} to show the
     * {@code Toolbox} or {@code false} to hide it.
     * @returns {void}
     */
    _setToolboxVisible(visible) {
        this.props.dispatch(setToolboxVisible(visible));
    }
}

/**
 * Maps (parts of) the redux state to the associated {@code Conference}'s props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const { connecting, connection } = state['features/base/connection'];
    const tracks = state['features/base/tracks'];
    const participants = state['features/base/participants'];
    const {
        conference,
        joining,
        membersOnly,
        leaving
    } = state['features/base/conference'];
    const { isOpen } = state['features/participants-pane'];
    const { aspectRatio, reducedUI } = state['features/base/responsive-ui'];

    // XXX There is a window of time between the successful establishment of the
    // XMPP connection and the subsequent commencement of joining the MUC during
    // which the app does not appear to be doing anything according to the redux
    // state. In order to not toggle the _connecting props during the window of
    // time in question, define _connecting as follows:
    // - the XMPP connection is connecting, or
    // - the XMPP connection is connected and the conference is joining, or
    // - the XMPP connection is connected and we have no conference yet, nor we
    //   are leaving one.
    const connecting_
        = connecting || (connection && (!membersOnly && (joining || (!conference && !leaving))));
    const { enabled, remoteParticipants } = state['features/filmstrip'];

    return {
        ...abstractMapStateToProps(state),
        _aspectRatio: aspectRatio,
        _calendarEnabled: isCalendarEnabled(state),
        _connecting: Boolean(connecting_),
        _filmstripVisible: isFilmstripVisible(state),
        _fullscreenEnabled: getFeatureFlag(state, FULLSCREEN_ENABLED, true),
        _isParticipantsPaneOpen: isOpen,
        _largeVideoParticipantId: state['features/large-video'].participantId,
        _pictureInPictureEnabled: getFeatureFlag(state, PIP_ENABLED),
        _reducedUI: reducedUI,
        _showLobby: getIsLobbyVisible(state),

        // _toolboxVisible: isToolboxVisible(state),
        _toolboxVisible: true,
        _videoMuted: isLocalCameraTrackMuted(tracks),
        _participants: remoteParticipants,
        _tracks: tracks
    };
}

export default connect(_mapStateToProps)(Conference);
