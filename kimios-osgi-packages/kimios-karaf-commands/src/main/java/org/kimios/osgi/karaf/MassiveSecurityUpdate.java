/*
 * Kimios - Document Management System Software
 * Copyright (C) 2008-2015  DevLib'
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

package org.kimios.osgi.karaf;

import org.apache.karaf.shell.commands.Argument;
import org.apache.karaf.shell.commands.Command;
import org.apache.karaf.shell.commands.Option;
import org.kimios.kernel.dms.DMEntity;
import org.kimios.kernel.dms.FactoryInstantiator;
import org.kimios.kernel.dms.utils.PathElement;
import org.kimios.kernel.security.DMEntitySecurity;

import java.util.ArrayList;
import java.util.List;

/**
 */
@Command(description = "Security Utility", name = "security-add", scope = "kimios")
public class MassiveSecurityUpdate extends KimiosCommand {

    @Option(name = "-r", aliases = "--read", description = "Read Acl")
    boolean read = false;
    @Option(name = "-w", aliases = "--write", description = "Write Acl")
    boolean write = false;
    @Option(name = "-f", aliases = "--full-access", description = "Full Access Acl")
    boolean fullAccess = false;
    @Option(name = "-n", aliases = "--no-access", description = "No access Acl")
    boolean noAccess = false;

    @Option(name = "-g",
            aliases = "--group",
            description = "Security Entity Is Group",
            required = false, multiValued = false)
    boolean group = false;

    @Option(name = "-x", aliases = "--execute", required = false)
    boolean runMode = false;

    @Option(name = "-s", required = false, valueToShowInHelp = "<user/group>@<domain>")
    String userDef;

    @Option(name = "-e", aliases = "--entity-path", required = false, multiValued = true)
    String[] paths;


    @Override
    protected void doExecuteKimiosCommand() throws Exception {


        List<DMEntitySecurity> securities = (List) this.session.get("currentAddedSecurities");
        if (!runMode) {
            String secId = userDef.split("@")[0];
            String secSource = userDef.split("@")[1];


            if (securities == null) {
                securities = new ArrayList<DMEntitySecurity>();
                this.session.put("currentAddedSecurities", securities);
            }


            DMEntitySecurity security = new DMEntitySecurity();
            security.setName(secId);
            security.setSource(secSource);
            security.setType(group ? 2 : 1);
            security.setFullAccess(fullAccess);
            security.setRead(read);
            security.setWrite(write);
            if (noAccess) {
                security.setWrite(false);
                security.setRead(false);
                security.setFullAccess(false);
            }

            securities.add(security);


            System.out.println("Currently Set Securities: ");
            for (DMEntitySecurity sec : securities) {
                this.session.getConsole().println((sec.getType() == 1 ? "user" : "group") + "\t" + sec.getName() + "@" + sec.getSource()
                        + " read: " + sec.isRead() + " write: " + sec.isWrite() + " full: " + sec.isFullAccess());
            }


        } else {
            if (securities == null || securities.size() == 0) {
                System.out.println("No securities defined");
            } else {
                //defined for entity
                if (paths != null && paths.length > 0) {
                    for (String p : paths) {
                        //load entity and add securities
                        List<DMEntity> entities = FactoryInstantiator.getInstance().getDmEntityFactory().getEntities(p);
                        for (DMEntity entity : entities) {
                            for (DMEntitySecurity dmEntitySecurity : securities) {
                                dmEntitySecurity.setDmEntity(entity);
                                org.kimios.kernel.security.FactoryInstantiator.getInstance().getDMEntitySecurityFactory()
                                        .saveDMEntitySecurity(dmEntitySecurity);
                            }
                        }
                    }
                } else {
                    System.out.println("No entities defined");
                }
            }
        }
    }
}
