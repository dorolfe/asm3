/*jslint browser: true, forin: true, eqeq: true, white: true, sloppy: true, vars: true, nomen: true */
/*global $, jQuery, _, additional, asm, common, config, controller, dlgfx, format, geo, header, html, validate */

$(function() {

    var person_new = {

        render: function() {
            return [
                '<div id="dialog-similar" style="display: none" title="' + html.title(_("Similar Person")) + '">',
                '<p><span class="ui-icon ui-icon-alert" style="float: left; margin: 0 7px 20px 0;"></span>',
                _("This person is very similar to another person on file, carry on creating this record?"),
                '<br /><br />',
                '<span class="similar-person"></span>',
                '</p>',
                '</div>',
                html.content_header(_("Add a new person")),
                '<table class="asm-table-layout">',
                '<tr>',
                '<td><label for="ownertype">' + _("Class") + '</label></td>',
                '<td><select id="ownertype" data="ownertype" class="asm-selectbox">',
                '<option value="1">' + _("Individual/Couple") + '</option>',
                '<option value="2">' + _("Organization") + '</option>',
                '</select></td>',
                '</tr>',
                '<tr class="tag-individual">',
                '<td><label for="title">' + _("Title") + '</label></td>',
                '<td><input class="asm-textbox" maxlength="50" id="title" data="title" type="textbox" /></td>',
                '</tr>',
                '<tr class="tag-individual">',
                '<td><label for="initials">' + _("Initials") + '</label></td>',
                '<td><input class="asm-textbox" maxlength="50" id="initials" data="initials" type="textbox" /></td>',
                '</tr>',
                '<tr class="tag-individual">',
                '<td><label for="forenames">' + _("First name(s)") + '</label></td>',
                '<td><input class="asm-textbox" maxlength="200" id="forenames" data="forenames" type="textbox" /></td>',
                '</tr>',
                '<tr>',
                '<td><label for="surname" class="tag-individual">' + _("Last name") + '</label>',
                '<label for="surname" class="tag-organisation">' + _("Organization name") + '</label></td>',
                '<td><input class="asm-textbox" maxlength="100" id="surname" data="surname" type="textbox" /></td>',
                '</tr>',
                '<tr>',
                '<td><label for="address">' + _("Address") + '</label></td>',
                '<td><textarea class="asm-textareafixed" id="address" data="address" rows="3"></textarea></td>',
                '</tr>',
                '<tr class="towncounty">',
                '<td><label for="town">' + _("City") + '</label></td>',
                '<td><input class="asm-textbox" maxlength="100" id="town" data="town" type="textbox" /></td>',
                '</tr>',
                '<tr class="towncounty">',
                '<td><label for="county">' + _("State") + '</label></td>',
                '<td><input class="asm-textbox" maxlength="100" id="county" data="county" type="textbox" /></td>',
                '</tr>',
                '<tr>',
                '<td><label for="postcode">' + _("Zipcode") + '</label></td>',
                '<td><input class="asm-textbox" id="postcode" data="postcode" type="textbox" /></td>',
                '</tr>',
                '<tr>',
                '<td><label for="hometelephone">' + _("Home Phone") + '</label></td>',
                '<td><input class="asm-textbox" id="hometelephone" data="hometelephone" type="textbox" /></td>',
                '</tr>',
                '<tr>',
                '<td><label for="worktelephone">' + _("Work Phone") + '</label></td>',
                '<td><input class="asm-textbox" id="worktelephone" data="worktelephone" type="textbox" /></td>',
                '</tr>',
                '<tr>',
                '<td><label for="mobiletelephone">' + _("Cell Phone") + '</label></td>',
                '<td><input class="asm-textbox" id="mobiletelephone" data="mobiletelephone" type="textbox" /></td>',
                '</tr>',
                '<tr>',
                '<td><label for="emailaddress">' + _("Email Address") + '</label></td>',
                '<td><input class="asm-textbox" maxlength="200" id="emailaddress" data="emailaddress" type="textbox" /></td>',
                '</tr>',
                '<tr>',
                '<td><label for="flags">' + _("Flags") + '</label></td>',
                '<td>',
                '<select id="flags" data="flags" class="asm-bsmselect" multiple="multiple">',
                '</select>',
                '</td>',
                '</tr>',
                '<tr id="jurisdictionrow">',
                '<td><label for="jurisdiction">' + _("Jurisdiction") + '</label></td>',
                '<td>',
                '<select id="jurisdiction" data="jurisdiction" class="asm-selectbox">',
                html.list_to_options(controller.jurisdictions, "ID", "JURISDICTIONNAME"),
                '</select>',
                '</td>',
                '</tr>',
                '<tr id="siterow">',
                '<td><label for="site">' + _("Site") + '</label></td>',
                '<td>',
                '<select id="site" data="site" class="asm-selectbox">',
                '<option value="0">' + _("(all)") + '</option>',
                html.list_to_options(controller.sites, "ID", "SITENAME"),
                '</select>',
                '</td>',
                '</tr>',
                additional.additional_mandatory_fields(controller.additional),
                '</table>',
                '<input id="latlong" data="latlong" type="hidden" value="" />',
                '<div class="centered">',
                '<button id="addedit">' + html.icon("person-add") + ' ' + _("Create and edit") + '</button>',
                '<button id="add">' + html.icon("person-add") + ' ' + _("Create") + '</button>',
                '<button id="reset">' + html.icon("delete") + ' ' + _("Reset") + '</button>',
                '</div>',
                html.content_footer()
            ].join("\n");
        },

        bind: function() {
            var validation = function() {
                // Remove any previous errors
                header.hide_error();
                validate.reset();
                if (!validate.notblank([ "surname" ])) { return false; }
                // mandatory additional fields
                if (!additional.validate_mandatory()) { return false; }
                return true;
            };

            var addPerson = function() {
                if (!validation()) { 
                    $("#asm-content button").button("enable"); 
                    return; 
                }
                header.show_loading(_("Creating..."));
                var address = $("#address").val(),
                    town = $("#town").val(),
                    county = $("#county").val(),
                    postcode = $("#postcode").val();
                var addrhash = geo.address_hash(address, town, county, postcode);
                var formdata = $("input, textarea, select").not(".chooser").toPOST();
                common.ajax_post("person_new", formdata)
                    .then(function(personid) {
                        if (personid && person_new.create_and_edit) { 
                            common.route("person?id=" + personid); 
                        }
                        else {
                            header.show_info(_("Person successfully created"));
                        }
                        $("#asm-content button").button("enable");
                        geo.get_lat_long(address, town, county, postcode)
                            .then(function(lat, lon) {
                                if (lat) {
                                    var latlong = lat + "," + lon + "," + addrhash;
                                    var formdata = "mode=latlong&personid=" + personid + "&latlong=" + latlong;
                                    common.ajax_post("person", formdata);
                                }
                            });
                    })
                    .always(function() {
                        $("#asm-content button").button("enable");
                    });

            };

            var similar_dialog = function() {
                var b = {}; 
                b[_("Create")] = function() {
                    $("#dialog-similar").disable_dialog_buttons();
                    addPerson();
                    $("#asm-content button").button("enable");
                };
                b[_("Cancel")] = function() { 
                    $(this).dialog("close");
                    $("#asm-content button").button("enable");
                };
                $("#dialog-similar").dialog({
                     resizable: false,
                     modal: true,
                     width: 500,
                     dialogClass: "dialogshadow",
                     show: dlgfx.delete_show,
                     hide: dlgfx.delete_hide,
                     buttons: b
                });
            };

            var check_for_similar = function() {
                if (!validation()) { 
                    $("#asm-content button").button("enable"); 
                    return; 
                }
                var formdata = "mode=similar&" + $("#emailaddress, #surname, #forenames, #address").toPOST();
                common.ajax_post("person_embed", formdata)
                    .then(function(result) { 
                        var people = jQuery.parseJSON(result);
                        var rec = people[0];
                        if (rec === undefined) {
                            addPerson();
                        }
                        else {
                            var disp = "<span class=\"justlink\"><a class=\"asm-embed-name\" href=\"person?id=" + rec.ID + "\">" + rec.OWNERNAME + "</a></span>";
                            disp += "<br/>" + rec.OWNERADDRESS + "<br/>" + rec.OWNERTOWN + "<br/>" + rec.OWNERCOUNTY + "<br/>" + rec.OWNERPOSTCODE + "<br/>" + rec.HOMETELEPHONE + "<br/>" + rec.WORKTELEPHONE + "<br/>" + rec.MOBILETELEPHONE + "<br/>" + rec.EMAILADDRESS;
                            $(".similar-person").html(disp);
                            similar_dialog();
                        }
                    });
            };

            var check_org = function() {
                // If it's an organisation, only show the org fields,
                // otherwise show individual
                if ($("#ownertype").val() == 2) {
                    $(".tag-organisation").fadeIn();
                    $(".tag-individual").fadeOut();
                }
                else {
                    $(".tag-organisation").fadeOut();
                    $(".tag-individual").fadeIn();
                }
            };

            $("#ownertype").change(check_org);
            check_org();

            // Load the person flag options
            html.person_flag_options(null, controller.flags, $("#flags"));

            if (config.bool("HideTownCounty")) {
                $(".towncounty").hide();
            }

            if (config.bool("DisableAnimalControl")) {
                $("#jurisdictionrow").hide();
            }

            if (!config.bool("MultiSiteEnabled")) {
                $("#siterow").hide();
            }
            else {
                $("#site").select("value", asm.siteid);
            }

            $("#town").autocomplete({ source: controller.towns.split("|") });
            $("#county").autocomplete({ source: controller.counties.split("|") });
            $("#town").blur(function() {
                if ($("#county").val() == "") {
                    var tc = html.decode(controller.towncounties);
                    var idx = tc.indexOf($("#town").val() + "^");
                    if (idx != -1) {
                        $("#county").val(tc.substring(tc.indexOf("^^", idx) + 2, tc.indexOf("|", idx)));
                    }
                }
            });


            $("#add").button().click(function() {
                person_new.create_and_edit = false;
                $("#asm-content button").button("disable");
                check_for_similar();
            });

            $("#addedit").button().click(function() {
                person_new.create_and_edit = true;
                $("#asm-content button").button("disable");
                check_for_similar();
            });


            $("#reset").button().click(function() {
                person_new.reset();
            });
        },

        sync: function() {
            person_new.reset();
        },

        reset: function() {
            $(".asm-textbox, .asm-textarea, .asm-textareafixed").val("").change();
            $(".asm-checkbox").prop("checked", false).change();
            $(".asm-personchooser").personchooser("clear");
            $("#flags option").prop("selected", false);
            $("#flags").change();

            // Remove any retired lookups from the lists
            $(".asm-selectbox").select("removeRetiredOptions");

        },

        destroy: function() {
            common.widget_destroy("#dialog-similar");
        },

        name: "person_new",
        animation: "newdata",
        autofocus: "#ownertype",
        title: function() { return _("Add a new person"); },
        routes: {
            "person_new": function() { common.module_loadandstart("person_new", "person_new"); }
        }

    };

    common.module_register(person_new);

});
