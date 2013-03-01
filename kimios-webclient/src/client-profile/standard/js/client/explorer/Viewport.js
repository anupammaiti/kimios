/*
 * Kimios - Document Management System Software
 * Copyright (C) 2012-2013  DevLib'
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 2 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
kimios.explorer.Viewport = Ext.extend(Ext.Viewport, {

    constructor: function (config) {
        this.id = 'kimios-viewport';
        this.renderTo = 'body';
        this.layout = 'border';
        this.forceLayout = true;
        this.i18n = config.i18n;
        this.checkSession = config.checkSession;

        this.topContainer = new Ext.Panel({
            border: false,
            region: 'north',
            layout: 'fit',
            height: 49 // do not exceed 54 pixels
        });

        this.mainContainer = new Ext.Panel({
            border: false,
            region: 'center',
            layout: 'fit'
        });

        this.items = [this.topContainer, this.mainContainer];
        kimios.explorer.Viewport.superclass.constructor.call(this, config);
    },

    initComponent: function () {
        kimios.explorer.Viewport.superclass.initComponent.apply(this, arguments);
        this.mask = new kimios.LoadMask(Ext.getBody());
        kimios.mask();

        this.rightsStore = kimios.store.getRightsStore();

        this.rightsStore.load({
            scope: this,
            callback: function (records, options, success) {
                this.rights = new kimios.security.Rights({
                    isWorkspaceCreator: records[0].data.canCreateWorkspace,
                    isAdmin: records[0].data.isAdmin,
                    isStudioUser: records[0].data.isStudioUser,
                    isRulesUser: records[0].data.isRulesUser,
                    isReportingUser: records[0].data.isReportingUser
                });
                kimios.ContextMenu.init();
                this.explorerPanel = new kimios.explorer.ExplorerPanel({
                    border: false,
                    rootText: 'kimios'
                });
                this.bookmarksPanel = new kimios.explorer.BookmarksPanel({
                    border: false
                });
                this.recentItemsPanel = new kimios.explorer.RecentItemsPanel({
                    border: false
                });
                this.searchBookmarkPanel = new kimios.explorer.SearchQueryPanel({
                    border: false
                });
                this.tasksPanel = new kimios.tasks.TasksPanel({});

                // west
                this.westPanel = new Ext.ux.GroupTabPanel({
                    id: 'kimios-west-container',
                    region: 'west',
                    width: 350,
                    split: true,
                    layoutConfig: {
                        titleCollapse: true,
                        animate: false
                    },
                    activeGroup: 0,
                    minWidth: 180,
                    border: true,
                    items: [
                        {
                            items: [this.explorerPanel]
                        },
                        {
                            items: [this.searchBookmarkPanel]
                        },
                        {
                            items: [this.bookmarksPanel]
                        },
                        {
                            items: [this.recentItemsPanel]
                        },
                        {
                            items: [this.tasksPanel]
                        }
                    ],
                    margins: '5 0 5 5',
                    listeners: {
                        scope: this,
                        expand: function (p) {
                            this.doLayout();
                        },
                        collapse: function (p) {
                            this.doLayout();
                        }
                    }
                });

                // center
                this.centerPanel = new Ext.Panel({
                    border: false,
                    region: 'center',
                    layout: 'border',
                    margins: '5 5 5 0',
                    items: [
                        new Ext.TabPanel({
                            //                  // TODO Drag'n Drop Across Tab Panel
                            //                  initEvents : function(){
                            //                    Ext.TabPanel.superclass.initEvents.call(this);
                            //                    this.strip.on('mouseover', this.onMouseOver, this);
                            //                  },
                            //                  onMouseOver : function(e){
                            ////                    e.preventDefault();
                            //                    var t = this.findTargets(e);
                            //                    console.log(t);
                            //                    if(t.item && t.item != this.activeTab){
                            //                      this.setActiveTab(t.item);
                            //                    }
                            //                  },
                            id: 'kimios-center-panel',
                            region: 'center',
                            enableTabScroll: true,
                            plain: true,
                            border: true,
                            listeners: {
                                scope: this,
                                tabchange: function (panel, tab) {
                                    //checker si l'activepanel a la recherche
                                    var panel = kimios.explorer.getActivePanel();
                                    if (panel)
                                        kimios.explorer.getToolbar().advancedSearchButton.toggle(panel.advancedSearchPanel && panel.advancedSearchPanel.isVisible(), true);
                                    else
                                        kimios.explorer.getToolbar().advancedSearchButton.toggle(false, true);
                                },
                                contextmenu: function (panel, tab, e) {
                                    new Ext.menu.Menu({
                                        items: [
                                            {
                                                text: kimios.lang('NewTab'),
                                                iconCls: 'role-workspace',
                                                scope: this,
                                                handler: function () {
                                                    this.newTab(tab.uid, tab.type);
                                                }
                                            },
                                            {
                                                text: kimios.lang('CloseTab'),
                                                iconCls: 'close',
                                                handler: function () {
                                                    var centerPanel = Ext.getCmp('kimios-center-panel');
                                                    if (centerPanel.items.length > 1)
                                                        tab.destroy();
                                                }
                                            }
                                        ]
                                    }).showAt(e.getXY());
                                }
                            }
                        })
                    ]
                });

                //top
                this.topPanel = new Ext.Panel({
                    border: false,
                    layout: 'hbox',
                    items: [
                        new Ext.Panel({
                            border: false,
                            width: 280,
                            tbar: new Ext.Toolbar({
                                style: 'background-image: url(); background-color:#fff;',
                                height: this.topContainer.height + 1, // ie fix
                                items: ['<img style="padding:3px; height: 40px" src="' + srcContextPath + '/images/logo.png" border="0" align="absmiddle" alt="kimios" />']
                            })
                        }),
                        new Ext.Panel({
                            border: false,
                            flex: 1,
                            tbar: new kimios.explorer.Toolbar({
                                style: 'background-image: url(); background-color:#fff;',
                                height: this.topContainer.height + 1 // ie fix
                            })
                        })
                    ]
                });

                //main
                this.mainPanel = new Ext.Container({
                    layout: 'border',
//                    items: [this.westPanel, this.eastPanel, this.centerPanel]
                    items: [this.westPanel, this.centerPanel]
                });
                this.topContainer.add(this.topPanel);
                this.mainContainer.add(this.mainPanel);

                // layout fix
                this.doLayout();
                // open default tab
                this.newTab();

                // start tasks checker thread (also used to check session)
                this.tasksChecker = {
                    run: function () {
                        kimios.explorer.getTasksPanel().refresh();
                    },
                    interval: (this.checkSession * 1000)
                };
                Ext.TaskMgr.start(this.tasksChecker);
                kimios.unmask();
            }
        });
    },

    changeLanguage: function (lang) {
        kimios.store.getLangStore(lang).load({
            callback: function (records, options, success) {
                this.i18n = new kimios.i18n.Internationalization({
                    lang: lang,
                    records: records
                });
                this.mask = new kimios.LoadMask(Ext.getBody());
                kimios.explorer.getToolbar().refreshLanguage();
                kimios.explorer.getTreePanel().refreshLanguage();
                kimios.explorer.getSearchRequestsPanel().refreshLanguage();
                kimios.explorer.getBookmarksPanel().refreshLanguage();
                kimios.explorer.getRecentItemsPanel().refreshLanguage();
                kimios.explorer.getTasksPanel().refreshLanguage();
                kimios.ContextMenu.init();
                var mainPanel = kimios.explorer.getMainPanel();
                for (var i = 0; i < mainPanel.items.length; i++)
                    mainPanel.items.get(i).refreshLanguage();
                this.doLayout();
                kimios.Cookies.setCookie('kimios-web-client-language', lang, 365);
            },
            scope: this
        });
    },

    refreshGrids: function () {
        var gridTabPanel = kimios.explorer.getMainPanel();
        for (var i = 0; i < gridTabPanel.items.length; i++) {
            var tab = gridTabPanel.items.get(i);
            // check instance and reload tab
            if (tab.loadable == true) {
                tab.loadEntity();
            }
        }
    },

    refresh: function () {
        kimios.explorer.getTreePanel().refresh();
        kimios.explorer.getToolbar().refresh();
        kimios.explorer.getTasksPanel().refresh();
        kimios.explorer.getViewport().bookmarksPanel.refresh();
        kimios.explorer.getViewport().recentItemsPanel.refresh();
        this.refreshGrids();
        this.doLayout();
    },

    newTab: function (uid, type) {
        var gridPanel = new kimios.explorer.DMEntityGridPanel({});
        Ext.getCmp('kimios-center-panel').add(gridPanel);
        Ext.getCmp('kimios-center-panel').setActiveTab(gridPanel);
        gridPanel.loadEntity({
            uid: uid,
            type: type
        });
    }
});

