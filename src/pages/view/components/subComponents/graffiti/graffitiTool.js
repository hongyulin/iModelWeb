/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import { EventHandled, IModelApp } from "@bentley/imodeljs-frontend";
import { SelectTool } from "@bentley/imodeljs-markup";

function getSvgFile(uri) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", uri, false);
  xhr.send();
  return xhr.responseText;
}

export class GraffitiTool extends SelectTool {
  async onKeyTransition(wentDown, key) {
    if (EventHandled.Yes === await super.onKeyTransition(wentDown, key))
      return EventHandled.Yes;
    if (!wentDown)
      return EventHandled.No;
    const tools = IModelApp.tools;
    switch (key.key.toLowerCase()) {
      case "a":
        tools.run("Markup.Arrow");
        return EventHandled.Yes;
      case "c":
        tools.run("Markup.Circle");
        return EventHandled.Yes;
      case "d":
        tools.run("Markup.Distance");
        return EventHandled.Yes;
      case "e":
        tools.run("Markup.Ellipse");
        return EventHandled.Yes;
      case "l":
        tools.run("Markup.Line");
        return EventHandled.Yes;
      case "o":
        tools.run("Markup.Cloud");
        return EventHandled.Yes;
      case "p":
        tools.run("Markup.Polygon");
        return EventHandled.Yes;
      case "r":
        tools.run("Markup.Rectangle");
        return EventHandled.Yes;
      case "s":
        tools.run("Markup.Sketch");
        return EventHandled.Yes;
      case "t":
        tools.run("Markup.Text.Place");
        return EventHandled.Yes;
      case "1":
        const symbol1 = getSvgFile("Warning_sign.svg");
        if (undefined === symbol1)
          return EventHandled.No;
        tools.run("Markup.Symbol", symbol1);
        return EventHandled.Yes;
      case "2":
        const symbol2 = getSvgFile("window-area.svg");
        if (undefined === symbol2)
          return EventHandled.No;
        tools.run("Markup.Symbol", symbol2, true);
        return EventHandled.Yes;
    }
    return EventHandled.No;
  }
}

GraffitiTool.toolId = "iModelWeb.graffiti";
