'use strict'

import * as vscode from 'vscode';
import {exec} from 'child_process';
import {ccConfigHandler} from './ccConfigHandler';
import {ClearCase} from './clearcase';

export class UIInformation
{
	private m_statusbar: vscode.StatusBarItem;
	private m_isActive: boolean;

	public constructor(private m_context: vscode.ExtensionContext,
										 private m_configHandler: ccConfigHandler,
										 private m_editor: vscode.TextEditor,
										 private m_clearcase: ClearCase)
	{
		this.m_isActive = true;
		this.handleConfigState();
	}

	public createStatusbarItem()
	{
		this.m_statusbar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	}

	public bindEvents()
	{
		// configuration change event
		this.m_configHandler.onDidChangeConfiguration(this.handleConfigState, this);

		this.m_context.subscriptions.push(
			vscode.workspace.onDidOpenTextDocument(
				this.receiveDocument, this, this.m_context.subscriptions));
		this.m_context.subscriptions.push(
			vscode.workspace.onDidSaveTextDocument(
				this.receiveDocument, this, this.m_context.subscriptions));
		this.m_context.subscriptions.push(
			vscode.window.onDidChangeActiveTextEditor(
				this.receiveEditor, this, this.m_context.subscriptions));
		this.m_context.subscriptions.push(
			vscode.window.onDidChangeTextEditorViewColumn(
				this.receiveEditorColumn, this, this.m_context.subscriptions));
	}

	public receiveEditorColumn(event:vscode.TextEditorViewColumnChangeEvent)
	{
		if( event && this.m_isActive )
		{
			this.m_editor = event.textEditor;
			this.queryVersionInformation(this.m_editor.document.uri);
		}
	}

	public receiveDocument(event:vscode.TextDocument)
	{
		if( event && this.m_isActive )
		{
			this.queryVersionInformation(event.uri);
		}
	}

	public receiveEditor(event:vscode.TextEditor)
	{
		if( event && this.m_isActive )
		{
			this.m_editor = event;
			this.queryVersionInformation(event.document.uri);
		}
	}

	private handleConfigState()
	{
		this.m_isActive = this.m_configHandler.configuration.ShowStatusbar;

		if( this.m_isActive === false )
		{
			this.m_statusbar.hide();
		}
		else
		{
			this.initialQuery();
		}
	}

	public initialQuery()
	{
		if( this.m_isActive && this.m_editor && this.m_editor.document )
		{
			this.queryVersionInformation(this.m_editor.document.uri);
		}
	}

	public queryVersionInformation(iUri:vscode.Uri)
	{
		this.m_clearcase.getVersionInformation(iUri).then((value) => {
			this.updateStatusbar(value);
		}).catch((error) => {
			this.updateStatusbar(error);
		});
	}

	public updateStatusbar(iFileInfo:string)
	{
		if( iFileInfo !== undefined )
		{
			if( this.m_clearcase.hasConfigspec() === true || iFileInfo !== "" )
			{
				let version = "view private";
				if( iFileInfo !== "" )
					version = iFileInfo;
				this.m_statusbar.text = "[" + version + "]";
				this.m_statusbar.show();
			}
			else
			{
				this.m_statusbar.hide();
			}
		}
		else
		{
			this.m_statusbar.hide();
		}
	}

	public dispose()
	{
		this.m_statusbar.dispose();
	}
}
