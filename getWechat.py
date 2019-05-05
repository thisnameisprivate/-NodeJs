#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2018/3/7 20:34
# @Author  : hyang
# @Site    :
# @File    : weixin_test.py
# @Software: PyCharm

import json
import hashlib as hasher
import requests
import random
import time
import ssl
import urllib3
import re
from bs4 import BeautifulSoup
from PIL import Image  # pip install pillow
from urllib import parse

# https://wx.qq.com/
"""
访问首页
https://login.weixin.qq.com/qrcode/gZtXpqySmA==
https://login.wx.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=zh_CN&_=1520439689629
获得uuid
扫描二维码登录后返回一个链接
window.redirect_uri="https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage?ticket=ATAjHkeQox2qNj3HcDSIX1lJ@qrticket_0&uuid=gZtXpqySmA==&lang=zh_CN&scan=1520439709";
请求上面返回地址 获取返回的参数
用户初始化
url = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r=-21266882&pass_ticket={}".format(self.pass_ticket)
获取联系人username与nickname字典信息：
url = 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?pass_ticket={}&r=1520439753654&seq=0&skey={}'.format(
            self.pass_ticket, self.skey)
向联系人发送信息：
url = 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg?pass_ticket={}'.format(self.pass_ticket)
"""
import urllib3

# 解决某些环境下报<urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings()  # 关闭警告


class WxBot(object):
    def __init__(self):
        self.session = requests.Session()
        self.session.verify = False  # 忽略证书认证
        self.session.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36",
        }
        self.contact_dict = {}  # 联系人字典存储UserName和NickName

    def get_clientId(self):
        """
        解析ClientMsgId
        js代码
        e.ClientMsgId = e.LocalID = e.MsgId = (utilFactory.now() + Math.random().toFixed(3)).replace(".", "")
        :return: 
        """
        self.client_id = str(int(time.time()*1000)) + str(random.random())[:5].replace(".","")

    def get_uuid(self):
        """
        获取uuid
        :return:
        """
        url = 'https://login.wx.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=zh_CN&_=1520439689629'
        result = self.session.get(url).text
        print(result)
        self.uuid = re.findall(r'uuid = "(.*?)"', result)[0]
        print(self.uuid, "uuid已获取")

    def get_qcode(self):
        """
         获取扫描二维码
        :return:
        """
        url = "https://login.weixin.qq.com/qrcode/{}".format(self.uuid)
        with open('qcode.jpg', 'wb') as f:
            f.write(self.session.get(url).content)  # 图片内容用content获取
        image = Image.open('qcode.jpg')  # 读取图片对象
        image.show()  # 调用系统默认方式打开图片
        print('已扫描')

    def visit_login(self):
        url = "https://login.wx.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid={}&tip=0&r=-21311978&_=1520439689632".format(
            self.uuid)
        while True:
            result = self.session.get(url).text
            if '200' in result:
                self.redirect_url = re.findall(r'redirect_uri="(.*?)"', result)[0]
                break
        #print(self.redirect_url)
        print('登录成功')

    # 解析重定向的url
    def visit_parse(self):
        result = self.session.get(self.redirect_url, allow_redirects=False)
        soup = BeautifulSoup(result.text, 'lxml')
        self.skey = soup.find('skey').text
        self.wxsid = soup.find('wxsid').text
        self.wxuin = soup.find('wxuin').text
        self.pass_ticket = soup.find('pass_ticket').text
        self.isgrayscale = soup.find('isgrayscale').text

    def visit_init(self):
        """
        初始化
        :return:
        """
        url = "https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r=-21266882&pass_ticket={}".format(self.pass_ticket)
        data = {"BaseRequest":
                    {"Uin": self.wxuin,
                     "Sid": self.wxsid,
                     "Skey": self.skey,
                     "DeviceID": self.DeviceID}}
        result = self.session.post(url, data=json.dumps(data))
        result.encoding = 'utf-8'
        # print(result.text)

    # 得到js参数DeviceID
    def get_DeviceID(self):
        """
        js代码https://res.wx.qq.com/a/wx_fed/webwx/res/static/js/index_ca360ff.js
        getDeviceID:function(){return"e"+(""+Math.random().toFixed(15)).substring(2,17)},
        :return:
        """
        self.DeviceID = 'e' + str(round(random.random(), 15))[2:17]

    # 获得所有联系人 建立username和nickname对应的字典
    def get_contact(self):
        url = 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?pass_ticket={}&r=1520439753654&seq=0&skey={}'.format(
            self.pass_ticket, self.skey)
        result = self.session.get(url)
        result.encoding = 'utf-8'
        contact_dict = result.json()
        print('获得联系人数：', contact_dict['MemberCount'])
        for item in contact_dict.get('MemberList'):
            self.contact_dict[item['NickName']] = item['UserName']
        print(self.contact_dict)

    # 发送信息函数
    def send_msg(self):
        url = 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg?pass_ticket={}'.format(self.pass_ticket)
        data = {"BaseRequest":
                 dict(Uin=self.wxuin, Sid=self.wxsid, Skey=self.skey, DeviceID=self.DeviceID),
                "Msg": {"Type": 1, 'Content': "你好，节日快乐",
                "FromUserName": self.contact_dict["杨皓彭"],
                "ToUserName": self.contact_dict["千懿"],
                "LocalID": self.client_id,
                "ClientMsgId": self.client_id}, "Scene": 0}
        """
        我们在post请求数据时，响应的内容是json数据，但是返回的json数据中文显示有问题，
        变成 \\uXXX的形式。这是因为中文以 unicode 编码了，
        而默认是以ASCII解析的，中文不在ASCII编码中，所以无法显示
       """
        print((json.dumps(data, ensure_ascii= False, indent= 4)))  # 加入ensure_ascii= False,可使中文正常转换
        result = self.session.post(url, data=json.dumps(data, ensure_ascii=False, indent=4).encode('utf-8'))  # 转换为utf-8
        result.encoding = 'utf-8'
        print('消息发送成功' if result.json().get('BaseResponse')['Ret'] == 0 else '消息发送失败' )

if __name__ == '__main__':
    wx = WxBot()
    wx.get_clientId()
    wx.get_uuid()
    wx.get_qcode()
    wx.visit_login()
    wx.visit_parse()
    wx.get_DeviceID()
    wx.visit_init()
    wx.get_contact()
    wx.send_msg()