/*
 * Kimios - Document Management System Software
 * Copyright (C) 2008-2014  DevLib'
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
 * aong with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.kimios.controller;

import org.kimios.client.controller.FolderController;
import org.kimios.kernel.ws.pojo.Folder;
import org.kimios.kernel.ws.pojo.User;

import java.util.Calendar;
import java.util.Map;

public class FolderActionHandler extends Controller {

  public FolderActionHandler(Map<String, String> parameters) {
    super(parameters);
  }

  public String execute() throws Exception {
    if (action != null) {
      if (action.equals("UpdateFolder"))
        updateFolder();
      if (action.equals("NewFolder"))
        addFolder();

      return "";
    } else
      return "NOACTION";
  }

    private void addFolder() throws Exception {

    User user = securityController.getUser(sessionUid);
    boolean isSecurityInherited = false;
    isSecurityInherited = Boolean.parseBoolean(this.parameters.get("isSecurityInherited"));
    FolderController fsm = folderController;
    Folder f = new Folder();
    f.setUid(-1);
    f.setCreationDate(Calendar.getInstance());
    f.setName(parameters.get("name"));
    f.setOwner(user.getUid());
    f.setOwnerSource(user.getSource());
    f.setParentType(Integer.parseInt(this.parameters.get("parentType")));
    f.setParentUid(Long.parseLong(this.parameters.get("parentUid")));
    long folderUid = fsm.createFolder(sessionUid, f, isSecurityInherited);
    f.setUid(folderUid);
    if (!isSecurityInherited) {
      securityController.updateDMEntitySecurities(sessionUid, folderUid, 2, false,
                       false,
              DMEntitySecuritiesParser.parseFromJson(this.parameters.get("sec"),
          folderUid, 2));
    }
  }

  private void updateFolder() throws Exception {
    FolderController fsm = folderController;
    long folderUid = Long.parseLong(parameters.get("uid"));
    Folder f = fsm.getFolder(sessionUid, folderUid);
    f.setName(parameters.get("name"));
    fsm.updateFolder(sessionUid, f);
    boolean recursive = false;
    boolean appendSecMode = true;
    recursive = parameters.get("isRecursive") != null && parameters.get("isRecursive").equals("true");
    if (securityController.hasFullAccess(sessionUid, f.getUid(), 2)) {
      boolean changeSecurity = true;
      if (parameters.get("changeSecurity") != null)
        changeSecurity = Boolean.parseBoolean(parameters.get("changeSecurity"));
      if (parameters.get("appendMode") != null)
          appendSecMode = Boolean.parseBoolean(parameters.get("appendSecMode"));
      if  (changeSecurity == true)
        securityController.updateDMEntitySecurities(sessionUid, folderUid, 2, recursive, appendSecMode,
                DMEntitySecuritiesParser.parseFromJson(parameters.get("sec"), folderUid, 2));
    }
  }
}

