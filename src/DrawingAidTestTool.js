/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/

import {
    IModelJson as GeomJson,
    LineString3d,
    Point3d,
    Vector3d,
  } from "@bentley/geometry-core";
  import {
    AccuDrawHintBuilder,
    AccuDrawShortcuts,
    BeButtonEvent,
    DecorateContext,
    DynamicsContext,
    EventHandled,
    GraphicType,
    HitDetail,
    IModelApp,
    PrimitiveTool,
    RotationMode,
    SnapStatus,
  } from "@bentley/imodeljs-frontend";
  import {
    ColorDef,
    GeometryStreamProps,
  } from "@bentley/imodeljs-common";
  
  export class DrawingAidTestTool extends PrimitiveTool {
    toolId = "DrawingAidTest.Points";
    points = [];
    _snapGeomId;
  
    requireWriteableTarget() { return false; }
    onPostInstall() { super.onPostInstall(); this.setupAndPromptForNextAction(); }
  
    setupAndPromptForNextAction() {
      IModelApp.accuSnap.enableSnap(true);
  
      if (0 === this.points.length)
        return;
  
      const hints = new AccuDrawHintBuilder();
      hints.enableSmartRotation = true;
  
      if (this.points.length > 1 && !(this.points[this.points.length - 1].isAlmostEqual(this.points[this.points.length - 2])))
        hints.setXAxis(Vector3d.createStartEnd(this.points[this.points.length - 2], this.points[this.points.length - 1])); // Rotate AccuDraw to last segment...
  
      hints.setOrigin(this.points[this.points.length - 1]);
      hints.sendHints();
    }
  
    testDecorationHit(id){ return id === this._snapGeomId; }
  
    getDecorationGeometry(_hit) {
      if (this.points.length < 2)
        return undefined;
  
      const geomData = GeomJson.Writer.toIModelJson(LineString3d.create(this.points));
      return (undefined === geomData ? undefined : [geomData]);
    }
  
    decorate(context) {
      if (this.points.length < 2)
        return;
  
      if (undefined === this._snapGeomId)
        this._snapGeomId = this.iModel.transientIds.next;
  
      const builder = context.createGraphicBuilder(GraphicType.WorldDecoration, undefined, this._snapGeomId);
  
      builder.setSymbology(context.viewport.getContrastToBackgroundColor(), ColorDef.black, 1);
      builder.addLineString(this.points);
  
      context.addDecorationFromBuilder(builder);
    }
  
    onDynamicFrame(ev, context) {
      if (this.points.length < 1)
        return;
  
      const builder = context.createSceneGraphicBuilder();
  
      builder.setSymbology(context.viewport.getContrastToBackgroundColor(), ColorDef.black, 1);
      builder.addLineString([this.points[this.points.length - 1], ev.point]); // Only draw current segment in dynamics, accepted segments are drawn as pickable decorations...
  
      context.addGraphic(builder.finish());
    }
  
    async onDataButtonDown(ev) {
      this.points.push(ev.point.clone());
      this.setupAndPromptForNextAction();
  
      if (!this.isDynamicsStarted)
        this.beginDynamics();
  
      return EventHandled.No;
    }
  
    async onResetButtonUp(_ev) {
      if (undefined !== IModelApp.accuSnap.currHit) {
        const status = await IModelApp.accuSnap.resetButton(); // TESTING ONLY - NOT NORMAL TOOL OPERATION - Exercise AccuSnap hit cycling...only restart when no current hit or not hot snap on next hit...
        if (SnapStatus.Success === status)
          return EventHandled.No;
      }
      this.onReinitialize();
      return EventHandled.No;
    }
  
    async onUndoPreviousStep(){
      if (0 === this.points.length)
        return false;
  
      this.points.pop();
      if (0 === this.points.length)
        this.onReinitialize();
      else
        this.setupAndPromptForNextAction();
      return true;
    }
  
    async onKeyTransition(wentDown, keyEvent) {
      // TESTING ONLY - TBD Keyboard shortcuts...
      if (wentDown) {
        switch (keyEvent.key.toLowerCase()) {
          case " ":
            AccuDrawShortcuts.changeCompassMode();
            break;
          case "enter":
            AccuDrawShortcuts.lockSmart();
            break;
          case "x":
            AccuDrawShortcuts.lockX();
            break;
          case "y":
            AccuDrawShortcuts.lockY();
            break;
          case "z":
            AccuDrawShortcuts.lockZ();
            break;
          case "a":
            AccuDrawShortcuts.lockAngle();
            break;
          case "d":
            AccuDrawShortcuts.lockDistance();
            break;
          case "t":
            AccuDrawShortcuts.setStandardRotation(RotationMode.Top);
            break;
          case "f":
            AccuDrawShortcuts.setStandardRotation(RotationMode.Front);
            break;
          case "s":
            AccuDrawShortcuts.setStandardRotation(RotationMode.Side);
            break;
          case "v":
            AccuDrawShortcuts.setStandardRotation(RotationMode.View);
            break;
          case "o":
            AccuDrawShortcuts.setOrigin();
            break;
          case "c":
            AccuDrawShortcuts.rotateCycle(false);
            break;
          case "q":
            AccuDrawShortcuts.rotateAxes(true);
            break;
          case "e":
            AccuDrawShortcuts.rotateToElement(false);
            break;
          case "r":
            AccuDrawShortcuts.defineACSByPoints();
            break;
        }
      }
  
      return EventHandled.No;
    }
  
    onRestartTool() {
      const tool = new DrawingAidTestTool();
      if (!tool.run())
        this.exitTool();
    }
  }
  