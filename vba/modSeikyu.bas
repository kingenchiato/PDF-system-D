Option Explicit

' 請求書まわり
' 単価マスタ: A=品名キー B=単価(枚) C=備考
' 加工加算は設定シート B6以降

Public Sub 請求書を出す()
    Dim wsH As Worksheet, wsM As Worksheet, wsO As Worksheet, wsS As Worksheet
    Dim lastR As Long, i As Long, outR As Long
    Dim key As String, tanka As Double
    Dim kako As String, addYen As Double
    Dim qty As Long, kingaku As Double
    Dim officeName As String, prevOffice As String
    Dim subtotal As Double, tax As Double
    
    On Error GoTo EH
    
    Set wsH = ThisWorkbook.Worksheets("発注一覧")
    Set wsM = ThisWorkbook.Worksheets("単価マスタ")
    Set wsO = ThisWorkbook.Worksheets("請求明細")
    Set wsS = ThisWorkbook.Worksheets("設定")
    
    lastR = wsH.Cells(wsH.Rows.Count, 1).End(xlUp).Row
    If lastR < 2 Then
        MsgBox "発注が空です。", vbExclamation
        Exit Sub
    End If
    
    Application.ScreenUpdating = False
    wsO.Range("A2:J8000").ClearContents
    outR = 2
    prevOffice = Chr(1)
    
    For i = 2 To lastR
        officeName = CStr(wsH.Cells(i, 2).Value)
        qty = Val(wsH.Cells(i, 9).Value)
        If qty <= 0 Then GoTo Nx
        
        If officeName <> prevOffice Then
            If prevOffice <> Chr(1) Then
                Call WriteTax(wsO, outR, subtotal)
                outR = outR + 3
            End If
            subtotal = 0
            prevOffice = officeName
            wsO.Cells(outR, 1).Value = officeName & " 営業所"
            wsO.Cells(outR, 1).Font.Bold = True
            outR = outR + 1
        End If
        
        key = CStr(wsH.Cells(i, 4).Value)
        tanka = LookupTanka(wsM, key)
        If tanka = 0 Then
            ' 面積で仮単価（本番はマスタ必須）
            tanka = WorksheetFunction.Round( _
                (CDbl(wsH.Cells(i, 7).Value) * CDbl(wsH.Cells(i, 8).Value) / 1000000#) * 18500, 0)
        End If
        
        kako = CStr(wsH.Cells(i, 10).Value)
        addYen = KakoAdd(wsS, kako)
        
        kingaku = (tanka + addYen) * qty
        subtotal = subtotal + kingaku
        
        wsO.Cells(outR, 1).Value = wsH.Cells(i, 3).Value
        wsO.Cells(outR, 2).Value = wsH.Cells(i, 4).Value
        wsO.Cells(outR, 3).Value = wsH.Cells(i, 5).Value & " t" & wsH.Cells(i, 6).Value
        wsO.Cells(outR, 4).Value = wsH.Cells(i, 7).Value & "x" & wsH.Cells(i, 8).Value
        wsO.Cells(outR, 5).Value = qty
        wsO.Cells(outR, 6).Value = tanka
        wsO.Cells(outR, 7).Value = addYen
        wsO.Cells(outR, 8).Value = kingaku
        wsO.Cells(outR, 9).Value = kako
        wsO.Cells(outR, 10).Value = officeName
        outR = outR + 1
Nx:
    Next i
    
    If prevOffice <> Chr(1) Then
        Call WriteTax(wsO, outR, subtotal)
    End If
    
    Application.ScreenUpdating = True
    MsgBox "請求明細まで書きました。印刷レイアウトは御社の帳票に合わせます。", vbInformation
    wsO.Activate
    Exit Sub
EH:
    Application.ScreenUpdating = True
    MsgBox "請求書でエラー: " & Err.Description, vbCritical
End Sub

Private Sub WriteTax(wsO As Worksheet, ByRef outR As Long, subtotal As Double)
    Dim tax As Double
    tax = WorksheetFunction.Round(subtotal * 0.1, 0)
    wsO.Cells(outR, 7).Value = "小計"
    wsO.Cells(outR, 8).Value = subtotal
    outR = outR + 1
    wsO.Cells(outR, 7).Value = "消費税10%"
    wsO.Cells(outR, 8).Value = tax
    outR = outR + 1
    wsO.Cells(outR, 7).Value = "合計"
    wsO.Cells(outR, 8).Value = subtotal + tax
    wsO.Cells(outR, 7).Font.Bold = True
    wsO.Cells(outR, 8).Font.Bold = True
End Sub

Private Function LookupTanka(wsM As Worksheet, ByVal key As String) As Double
    Dim r As Long, lastR As Long
    lastR = wsM.Cells(wsM.Rows.Count, 1).End(xlUp).Row
    For r = 2 To lastR
        If wsM.Cells(r, 1).Value = key Then
            LookupTanka = CDbl(wsM.Cells(r, 2).Value)
            Exit Function
        End If
    Next r
    LookupTanka = 0
End Function

Private Function KakoAdd(wsS As Worksheet, ByVal kako As String) As Double
    Dim v As Double
    If InStr(kako, "穴") > 0 Then v = v + Val(wsS.Range("B7").Value)
    If InStr(kako, "R") > 0 Then v = v + Val(wsS.Range("B8").Value)
    If InStr(kako, "溶接") > 0 Then v = v + Val(wsS.Range("B9").Value)
    KakoAdd = v
End Function
