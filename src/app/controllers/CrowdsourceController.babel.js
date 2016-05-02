import $ from 'jquery';
import lang from 'dojo/_base/lang';
import URI from 'lib/urijs/src/URI';
import Portal from 'babel/utils/arcgis/portal/Portal';
import CrowdsourceBuilderController from 'mode!isBuilder?./CrowdsourceBuilderController';
import AppStore from 'babel/store/AppStore';
import AppMode from './mode/AppMode';
import AppConfig from './config/AppConfig';
import Layout from './layouts/Layout';
import User from './user/User';
import ContrbuteController from './contribute/ContrbuteController';
import EnvironmentConfig from 'babel/utils/arcgis/config/EnvironmentConfig';
import PortalActions from 'babel/actions/PortalActions';
import ConfigActions from 'babel/actions/ConfigActions';

export default class CrowdsourceController {

  constructor() {
    // Autobind methods
    this.updateAppState = this.updateAppState.bind(this);
    this.updatePageTitle = this.updatePageTitle.bind(this);
    this.createPortal = this.createPortal.bind(this);

    // Subscribe to state changes
    this.updateAppState();
    this.unsubscribeAppStore = AppStore.subscribe(this.updateAppState);

    const location = new URI(window.location);

    if (location.filename() === 'index.html') {
      window.history.replaceState({},null,location.filename('').href());
    }

    // TODO configure from app state
    EnvironmentConfig.configSharingUrl();

    this.appMode = new AppMode();
    this.appConfig = new AppConfig();

    if (window.location.protocol === 'https:') {
      this.createPortal();
      this.layout = new Layout();
      this.user = new User();
      this.contrbuteController = new ContrbuteController();
    }

    // Remove Loader
    $('#loadingIndicator').remove();

    if (lang.exists('appState.mode.isBuilder',this)) {
      this.builderController = new CrowdsourceBuilderController();
    }
  }

  updateAppState() {
    this.appState = AppStore.getState();
    this.updatePageTitle();
  }

  updatePageTitle() {
    const title = lang.getObject('appState.items.app.data.settings.components.intro.title',false,this);

    if (title !== this.htmlTitle) {
      this.htmlTitle = title;
      $('title').html(title);
    }
  }

  createPortal() {
    if (lang.exists('appState.config.sharingurl',this)) {
      const portal = new Portal(this.appState.config.sharingurl.split('/sharing/')[0]);

      PortalActions.setPortalInstance(portal);
      portal.on('load',() => {

        const portalHost = portal.portalHostname;
        const socialAvailable = portalHost === 'devext.arcgis.com' || portalHost === 'www.arcgis.com' ? true : false;

        ConfigActions.updateConfig({
          allowSocialLogin: socialAvailable
        });
      });

    }
  }

}
