Option Explicit

' 発注一覧 → 並べ表 / 請求書 / ラベル
' シート構成: 発注一覧, 並べ明細, 請求明細, ラベル台, 単価マスタ, 設定
' 2026/10

Public Const SHT_HATCHU As String = "発注一覧"
Public Const SHT_NARABE As String = "並べ明細"
Public Const SHT_SEIKYU As String = "請求明細"
Public Const SHT_LABEL As String = "ラベル台"
Public Const SHT_MASTER As String = "単価マスタ"
Public Const SHT_SET As String = "設定"

Public Sub 並べ表を作る()
    Dim wsH As Worksheet, wsN As Worksheet, wsS As Worksheet
    Dim lastR As Long, i As Long, n As Long
    Dim boardW As Double, boardH As Double, kerf As Double
    Dim curX As Double, curY As Double, rowH As Double
    Dim w As Double, d As Double, qty As Long, q As Long
    Dim pieceNo As Long, boardNo As Long
    Dim rotated As Boolean
    Dim msg As String
    
    On Error GoTo EH
    
    Set wsH = ThisWorkbook.Worksheets(SHT_HATCHU)
    Set wsN = ThisWorkbook.Worksheets(SHT_NARABE)
    Set wsS = ThisWorkbook.Worksheets(SHT_SET)
    
    boardW = CDbl(wsS.Range("B2").Value) ' 原板ヨコ mm  既定 2438
    boardH = CDbl(wsS.Range("B3").Value) ' 原板タテ mm  既定 1219
    kerf = CDbl(wsS.Range("B4").Value)   ' 刃幅
    If kerf <= 0 Then kerf = 3
    
    lastR = wsH.Cells(wsH.Rows.Count, 1).End(xlUp).Row
    If lastR < 2 Then
        MsgBox "発注一覧にデータがありません。", vbExclamation
        Exit Sub
    End If
    
    Application.ScreenUpdating = False
    
    wsN.Range("A2:L5000").ClearContents
    
    wsN.Range("A1:L1").Value = Array( _
        "原板No", "部材No", "営業所", "店舗", "品名", _
        "W", "D", "回転", "X", "Y", "材質", "加工")
    
    boardNo = 1
    pieceNo = 0
    curX = 0
    curY = 0
    rowH = 0
    
    For i = 2 To lastR
        If Val(wsH.Cells(i, 9).Value) <= 0 Then GoTo NextRow
        qty = CLng(wsH.Cells(i, 9).Value)
        
        For q = 1 To qty
            w = CDbl(wsH.Cells(i, 7).Value)
            d = CDbl(wsH.Cells(i, 8).Value)
            rotated = False
            
            ' そのまま入らなければ90度
            If w > boardW Or d > boardH Then
                If d <= boardW And w <= boardH Then
                    SwapDbl w, d
                    rotated = True
                Else
                    n = n + 1
                    wsN.Cells(n + 1, 1).Value = "特寸"
                    wsN.Cells(n + 1, 2).Value = ""
                    Call WritePiece(wsN, n + 1, wsH, i, w, d, rotated, -1, -1)
                    GoTo NextQty
                End If
            End If
            
            ' 現在行に入るか
            If curX > 0 And curX + w > boardW Then
                curY = curY + rowH + kerf
                curX = 0
                rowH = 0
            End If
            
            If curY + d > boardH Then
                boardNo = boardNo + 1
                curX = 0
                curY = 0
                rowH = 0
            End If
            
            ' 新しい原板でも入らない（理論上は上で特寸にしてるはず）
            If w > boardW Or d > boardH Then
                n = n + 1
                Call WritePiece(wsN, n + 1, wsH, i, w, d, rotated, -1, -1)
                wsN.Cells(n + 1, 1).Value = "特寸"
                GoTo NextQty
            End If
            
            pieceNo = pieceNo + 1
            n = n + 1
            Call WritePiece(wsN, n + 1, wsH, i, w, d, rotated, curX, curY)
            wsN.Cells(n + 1, 1).Value = boardNo
            wsN.Cells(n + 1, 2).Value = Format(pieceNo, "000")
            
            If d > rowH Then rowH = d
            curX = curX + w + kerf
NextQty:
        Next q
NextRow:
    Next i
    
    Application.ScreenUpdating = True
    
    msg = "並べました。" & vbCrLf & _
          "原板 " & boardNo & " 枚 / 部材 " & pieceNo & " 枚"
    MsgBox msg, vbInformation
    
    wsN.Activate
    Exit Sub
EH:
    Application.ScreenUpdating = True
    MsgBox "並べ表でエラー: " & Err.Description, vbCritical
End Sub

Private Sub WritePiece(wsN As Worksheet, destR As Long, wsH As Worksheet, srcR As Long, _
                       w As Double, d As Double, rotated As Boolean, x As Double, y As Double)
    wsN.Cells(destR, 3).Value = wsH.Cells(srcR, 2).Value
    wsN.Cells(destR, 4).Value = wsH.Cells(srcR, 3).Value
    wsN.Cells(destR, 5).Value = wsH.Cells(srcR, 4).Value
    wsN.Cells(destR, 6).Value = w
    wsN.Cells(destR, 7).Value = d
    wsN.Cells(destR, 8).Value = IIf(rotated, "90", "")
    If x >= 0 Then
        wsN.Cells(destR, 9).Value = x
        wsN.Cells(destR, 10).Value = y
    Else
        wsN.Cells(destR, 9).Value = ""
        wsN.Cells(destR, 10).Value = ""
    End If
    wsN.Cells(destR, 11).Value = wsH.Cells(srcR, 5).Value
    wsN.Cells(destR, 12).Value = wsH.Cells(srcR, 10).Value
End Sub

Private Sub SwapDbl(ByRef a As Double, ByRef b As Double)
    Dim t As Double
    t = a
    a = b
    b = t
End Sub
